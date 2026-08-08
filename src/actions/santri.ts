"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/audit";
import { santriSchema, type SantriInput } from "@/lib/validations";

export type ActionState<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function tambahSantri(input: SantriInput): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = santriSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const newSantri = await db.$transaction(async (tx) => {
      const year = new Date().getFullYear().toString();
      const count = await tx.santri.count({ where: { tenantId } });
      const noInduk = `${year}${(count + 1).toString().padStart(4, "0")}`;

      const created = await tx.santri.create({
        data: {
          tenantId,
          noInduk,
          nama: data.nama,
          jenjang: data.jenjang,
          kelas: data.kelas,
          namaWali: data.namaWali,
          noHpWali: data.noHpWali,
          keterangan: data.keterangan,
        },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "CREATE",
        entitas: "Santri",
        entitasId: created.id,
        detail: { nama: created.nama, noInduk: created.noInduk },
      });

      return created;
    });

    revalidatePath("/santri");
    revalidatePath("/beranda");
    return { success: true, message: "Data santri berhasil ditambahkan", data: newSantri };
  } catch (error) {
    console.error("Gagal tambah santri:", error);
    return { success: false, message: "Gagal menyimpan data santri ke database" };
  }
}

export async function editSantri(id: string, input: SantriInput): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = santriSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const updatedSantri = await db.$transaction(async (tx) => {
      const updated = await tx.santri.update({
        where: { id, tenantId },
        data: {
          nama: data.nama,
          jenjang: data.jenjang,
          kelas: data.kelas,
          namaWali: data.namaWali,
          noHpWali: data.noHpWali,
          keterangan: data.keterangan,
        },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "UPDATE",
        entitas: "Santri",
        entitasId: updated.id,
        detail: { nama: updated.nama },
      });

      return updated;
    });

    revalidatePath("/santri");
    revalidatePath(`/santri/${id}`);
    return { success: true, message: "Data santri berhasil diperbarui", data: updatedSantri };
  } catch (error) {
    console.error("Gagal edit santri:", error);
    return { success: false, message: "Gagal memperbarui data santri" };
  }
}

export async function hapusSantri(id: string): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  try {
    await db.$transaction(async (tx) => {
      const countPembayaran = await tx.pembayaran.count({
        where: { santriId: id, tenantId, deletedAt: null },
      });

      if (countPembayaran > 0) {
        // Soft status nonaktif jika sudah punya riwayat pembayaran (BR-04)
        await tx.santri.update({
          where: { id, tenantId },
          data: { status: "TIDAK_AKTIF" },
        });
        await audit(tx, {
          tenantId,
          userId: session.user.id,
          aksi: "UPDATE",
          entitas: "Santri",
          entitasId: id,
          detail: { status: "TIDAK_AKTIF", alasan: "Memiliki riwayat pembayaran" },
        });
      } else {
        // Soft delete (ditangani Prisma extension deletedAt)
        await tx.santri.delete({ where: { id, tenantId } });
        await audit(tx, {
          tenantId,
          userId: session.user.id,
          aksi: "DELETE",
          entitas: "Santri",
          entitasId: id,
          detail: { id },
        });
      }
    });

    revalidatePath("/santri");
    revalidatePath("/beranda");
    return { success: true, message: "Data santri berhasil diproses" };
  } catch (error) {
    console.error("Gagal hapus santri:", error);
    return { success: false, message: "Gagal menghapus data santri" };
  }
}
