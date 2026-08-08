"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/audit";

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
