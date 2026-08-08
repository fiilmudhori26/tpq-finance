"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/audit";
import { z } from "zod";
import type { Jenjang } from "@prisma/client";

export type ActionState<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

const profilSchema = z.object({
  namaTpq: z.string().min(2, "Nama TPQ minimal 2 karakter"),
  alamat: z.string().optional(),
});

const sppRateSchema = z.object({
  jenjang: z.enum(["TKA", "TPA", "TQA"]),
  nominal: z.number().gt(0, "Nominal harus lebih dari 0"),
  tahunAjaran: z.string().min(4, "Tahun ajaran wajib diisi (misal 2024/2025)"),
});

const kategoriSchema = z.object({
  jenis: z.enum(["PEMASUKAN", "PENGELUARAN"]),
  nama: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

export async function simpanProfilTpq(input: { namaTpq: string; alamat?: string }): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = profilSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Validasi profil gagal" };

  try {
    await db.$transaction(async (tx) => {
      await tx.pengaturan.upsert({
        where: { tenantId_key: { tenantId, key: "profil" } },
        update: { value: parsed.data },
        create: { tenantId, key: "profil", value: parsed.data },
      });

      await tx.tenant.update({
        where: { id: tenantId },
        data: { nama: parsed.data.namaTpq, alamat: parsed.data.alamat },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "UPDATE",
        entitas: "Pengaturan",
        entitasId: tenantId,
        detail: { key: "profil", value: parsed.data },
      });
    });

    revalidatePath("/pengaturan");
    revalidatePath("/beranda");
    return { success: true, message: "Profil TPQ berhasil diperbarui" };
  } catch (error) {
    console.error("Gagal simpan profil:", error);
    return { success: false, message: "Gagal memperbarui profil TPQ" };
  }
}

export async function simpanSppRate(input: {
  jenjang: Jenjang;
  nominal: number;
  tahunAjaran: string;
}): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = sppRateSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Validasi SPP rate gagal" };

  try {
    const rate = await db.$transaction(async (tx) => {
      const res = await tx.sppRate.upsert({
        where: {
          tenantId_jenjang_tahunAjaran: {
            tenantId,
            jenjang: parsed.data.jenjang,
            tahunAjaran: parsed.data.tahunAjaran,
          },
        },
        update: { nominal: parsed.data.nominal, deletedAt: null },
        create: {
          tenantId,
          jenjang: parsed.data.jenjang,
          nominal: parsed.data.nominal,
          tahunAjaran: parsed.data.tahunAjaran,
        },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "UPDATE",
        entitas: "SppRate",
        entitasId: res.id,
        detail: { jenjang: res.jenjang, nominal: Number(res.nominal) },
      });

      return res;
    });

    revalidatePath("/pengaturan");
    revalidatePath("/pembayaran-spp");
    return { success: true, message: "Tarif SPP berhasil diperbarui", data: rate };
  } catch (error) {
    console.error("Gagal simpan SppRate:", error);
    return { success: false, message: "Gagal memperbarui tarif SPP" };
  }
}

export async function tambahKategori(input: {
  jenis: "PEMASUKAN" | "PENGELUARAN";
  nama: string;
}): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = kategoriSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Validasi kategori gagal" };

  try {
    const kat = await db.$transaction(async (tx) => {
      const created = await tx.kategori.create({
        data: {
          tenantId,
          jenis: parsed.data.jenis,
          nama: parsed.data.nama,
          isDefault: false,
        },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "CREATE",
        entitas: "Kategori",
        entitasId: created.id,
        detail: { nama: created.nama, jenis: created.jenis },
      });

      return created;
    });

    revalidatePath("/pengaturan");
    revalidatePath("/pemasukan");
    revalidatePath("/pengeluaran");
    return { success: true, message: "Kategori baru berhasil ditambahkan", data: kat };
  } catch (error) {
    console.error("Gagal tambah kategori:", error);
    return { success: false, message: "Gagal menambahkan kategori" };
  }
}

export async function hapusKategori(id: string): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  try {
    const kat = await db.kategori.findUnique({ where: { id, tenantId } });
    if (!kat) return { success: false, message: "Kategori tidak ditemukan" };
    if (kat.isDefault) return { success: false, message: "Kategori bawaan (default) tidak dapat dihapus" };

    await db.$transaction(async (tx) => {
      await tx.kategori.delete({ where: { id, tenantId } });
      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "DELETE",
        entitas: "Kategori",
        entitasId: id,
        detail: { nama: kat.nama },
      });
    });

    revalidatePath("/pengaturan");
    revalidatePath("/pemasukan");
    revalidatePath("/pengeluaran");
    return { success: true, message: "Kategori berhasil dihapus" };
  } catch (error) {
    console.error("Gagal hapus kategori:", error);
    return { success: false, message: "Gagal menghapus kategori" };
  }
}
