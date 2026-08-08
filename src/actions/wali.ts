"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { hashPassword } from "@better-auth/utils/password";
import { db } from "@/lib/db";
import { requireRole, getSession } from "@/lib/session";
import { audit } from "@/lib/audit";
import { akunWaliSchema } from "@/lib/validations";

export type ActionState<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function generateWaliToken(santriId: string): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  try {
    const token = await db.$transaction(async (tx) => {
      const santri = await tx.santri.findFirst({ where: { id: santriId, tenantId, deletedAt: null } });
      if (!santri) throw new Error("Santri tidak ditemukan.");

      const raw = randomBytes(16).toString("hex"); // 32 char unik
      const existing = await tx.waliToken.findUnique({ where: { santriId } });
      if (existing) return existing.token;

      const created = await tx.waliToken.create({
        data: { tenantId, santriId, token: raw },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "CREATE",
        entitas: "WaliToken",
        entitasId: created.id,
        detail: { santriId },
      });

      return created.token;
    });

    revalidatePath(`/santri/${santriId}`);
    return { success: true, message: "Link portal wali berhasil dibuat", data: token };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal membuat link portal wali";
    return { success: false, message: msg };
  }
}

export async function simpanAkunWali(input: {
  santriId: string;
  email: string;
  password: string;
}): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = akunWaliSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { santriId, email, password } = parsed.data;

  try {
    const waliUser = await db.$transaction(async (tx) => {
      const santri = await tx.santri.findFirst({ where: { id: santriId, tenantId, deletedAt: null } });
      if (!santri) throw new Error("Santri tidak ditemukan.");

      const existing = await tx.user.findUnique({ where: { email } });
      if (existing) throw new Error("Email sudah terdaftar.");

      const passwordHash = await hashPassword(password);
      const created = await tx.user.create({
        data: {
          tenantId,
          name: santri.namaWali ?? santri.nama,
          email,
          emailVerified: true,
          role: "WALI",
        },
      });
      await tx.account.create({
        data: {
          userId: created.id,
          providerId: "credential",
          accountId: created.id,
          password: passwordHash,
        },
      });
      await tx.santri.update({
        where: { id: santriId, tenantId },
        data: { waliUserId: created.id },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "CREATE",
        entitas: "WaliUser",
        entitasId: created.id,
        detail: { santriId, email },
      });

      return created;
    });

    revalidatePath(`/santri/${santriId}`);
    return { success: true, message: "Akun login wali berhasil dibuat", data: { email: waliUser.email } };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal membuat akun wali";
    return { success: false, message: msg };
  }
}

/** Tujuan redirect setelah login, berdasarkan role. */
export async function getHomePath(): Promise<string> {
  const s = await getSession();
  if (!s) return "/login";
  return s.user.role === "WALI" ? "/portal-wali" : "/beranda";
}
