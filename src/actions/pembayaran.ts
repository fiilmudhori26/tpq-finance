"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/audit";
import { pembayaranSppSchema, type PembayaranSppInput } from "@/lib/validations";

export type ActionState<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function catatPembayaranSpp(input: PembayaranSppInput): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA");
  const tenantId = session.user.tenantId;

  const parsed = pembayaranSppSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Normalisasi daftar bulan (unik, tanggal 1)
  const bulanSet = new Set<string>();
  for (const b of data.bulan) {
    const d = new Date(b);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    bulanSet.add(d.toISOString());
  }
  const bulanList = [...bulanSet]
    .map((iso) => new Date(iso))
    .sort((a, b) => a.getTime() - b.getTime());

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Validasi semua bulan belum dibayar sekaligus
      const existing = await tx.pembayaran.findMany({
        where: {
          tenantId,
          santriId: data.santriId,
          bulan: { in: bulanList },
          status: "LUNAS",
          deletedAt: null,
        },
      });
      if (existing.length > 0) {
        throw new Error("EC-03: Salah satu bulan sudah dibayar untuk santri tersebut.");
      }

      // 2. Dapatkan data santri
      const santri = await tx.santri.findUnique({
        where: { id: data.santriId, tenantId },
      });
      if (!santri) throw new Error("Santri tidak ditemukan.");

      // 3. Ambil atau buat Kategori "SPP Santri"
      let katSpp = await tx.kategori.findFirst({
        where: { tenantId, nama: "SPP Santri", jenis: "PEMASUKAN", deletedAt: null },
      });
      if (!katSpp) {
        katSpp = await tx.kategori.create({
          data: {
            tenantId,
            nama: "SPP Santri",
            jenis: "PEMASUKAN",
            isDefault: true,
          },
        });
      }

      const created: Array<{ noReferensi: string; bulan: Date; nominal: number }> = [];

      // 4. Loop per bulan: generate noReferensi, transaksi + pembayaran
      let countPembayaran = await tx.pembayaran.count({ where: { tenantId } });
      const yearStr = new Date().getFullYear().toString();

      for (const bulanDate of bulanList) {
        countPembayaran += 1;
        const noReferensi = `TRX-${yearStr}${countPembayaran.toString().padStart(5, "0")}`;
        const namaBulan = bulanDate.toLocaleString("id-ID", { month: "long", year: "numeric" });

        const trx = await tx.transaksi.create({
          data: {
            tenantId,
            jenis: "PEMASUKAN",
            kategoriId: katSpp.id,
            sumber: santri.nama,
            keterangan: `Pembayaran SPP ${namaBulan} - ${santri.nama} (${santri.noInduk})`,
            jumlah: data.nominal,
            tanggal: new Date(),
            createdById: session.user.id,
            status: "LUNAS",
          },
        });

        const pembayaran = await tx.pembayaran.create({
          data: {
            tenantId,
            santriId: data.santriId,
            transaksiId: trx.id,
            noReferensi,
            bulan: bulanDate,
            nominal: data.nominal,
            status: "LUNAS",
            metode: data.metode,
            paidAt: new Date(),
            createdById: session.user.id,
            catatan: data.catatan,
          },
        });

        await audit(tx, {
          tenantId,
          userId: session.user.id,
          aksi: "CREATE",
          entitas: "Pembayaran",
          entitasId: pembayaran.id,
          detail: {
            santriId: data.santriId,
            noReferensi,
            nominal: data.nominal,
            bulan: bulanDate.toISOString(),
          },
        });

        created.push({ noReferensi, bulan: bulanDate, nominal: Number(data.nominal) });
      }

      return created;
    });

    revalidateTag("dashboard");
    revalidatePath("/beranda");
    revalidatePath("/pembayaran-spp");
    revalidatePath(`/pembayaran-spp/${data.santriId}`);
    revalidatePath("/pemasukan");
    revalidatePath("/laporan");

    return {
      success: true,
      message: `${result.length} bulan SPP berhasil dibayar (No. Ref ${result.map((r) => r.noReferensi).join(", ")})`,
      data: result,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Gagal mencatat pembayaran SPP";
    console.error("Gagal catat SPP:", error);
    return { success: false, message: errMessage };
  }
}
