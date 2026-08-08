"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/audit";
import { transaksiSchema, type TransaksiInput } from "@/lib/validations";

export type ActionState<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function tambahTransaksi(input: TransaksiInput): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = transaksiSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const createdTransaksi = await db.$transaction(async (tx) => {
      const trx = await tx.transaksi.create({
        data: {
          tenantId,
          jenis: data.jenis,
          kategoriId: data.kategoriId,
          sumber: data.sumber,
          keterangan: data.keterangan,
          jumlah: data.jumlah,
          tanggal: data.tanggal,
          buktiUrl: data.buktiUrl,
          createdById: session.user.id,
          status: "LUNAS",
        },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "CREATE",
        entitas: "Transaksi",
        entitasId: trx.id,
        detail: { jenis: trx.jenis, jumlah: Number(trx.jumlah), sumber: trx.sumber },
      });

      return trx;
    });

    revalidateTag("dashboard");
    revalidatePath("/beranda");
    revalidatePath("/pemasukan");
    revalidatePath("/pengeluaran");
    revalidatePath("/laporan");
    return { success: true, message: `Transaksi ${data.jenis.toLowerCase()} berhasil disimpan`, data: createdTransaksi };
  } catch (error) {
    console.error("Gagal tambah transaksi:", error);
    return { success: false, message: "Gagal menyimpan transaksi ke database" };
  }
}

export async function editTransaksi(id: string, input: TransaksiInput): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = transaksiSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const updatedTransaksi = await db.$transaction(async (tx) => {
      const trx = await tx.transaksi.update({
        where: { id, tenantId },
        data: {
          jenis: data.jenis,
          kategoriId: data.kategoriId,
          sumber: data.sumber,
          keterangan: data.keterangan,
          jumlah: data.jumlah,
          tanggal: data.tanggal,
          buktiUrl: data.buktiUrl,
        },
      });

      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "UPDATE",
        entitas: "Transaksi",
        entitasId: trx.id,
        detail: { jenis: trx.jenis, jumlah: Number(trx.jumlah) },
      });

      return trx;
    });

    revalidateTag("dashboard");
    revalidatePath("/beranda");
    revalidatePath("/pemasukan");
    revalidatePath("/pengeluaran");
    revalidatePath("/laporan");
    return { success: true, message: "Transaksi berhasil diperbarui", data: updatedTransaksi };
  } catch (error) {
    console.error("Gagal edit transaksi:", error);
    return { success: false, message: "Gagal memperbarui transaksi" };
  }
}

export async function hapusTransaksi(id: string): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  try {
    await db.$transaction(async (tx) => {
      await tx.transaksi.delete({ where: { id, tenantId } });
      await audit(tx, {
        tenantId,
        userId: session.user.id,
        aksi: "DELETE",
        entitas: "Transaksi",
        entitasId: id,
        detail: { id },
      });
    });

    revalidateTag("dashboard");
    revalidatePath("/beranda");
    revalidatePath("/pemasukan");
    revalidatePath("/pengeluaran");
    revalidatePath("/laporan");
    return { success: true, message: "Transaksi berhasil dihapus" };
  } catch (error) {
    console.error("Gagal hapus transaksi:", error);
    return { success: false, message: "Gagal menghapus transaksi" };
  }
}
