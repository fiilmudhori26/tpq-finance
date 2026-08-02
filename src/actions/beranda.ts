"use server";

import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { formatRupiah } from "@/lib/format";

export interface KpiData {
  label: string;
  nilai: string;
  chip?: string;
  chipTone?: "positive" | "negative" | "neutral";
  icon: string;
  iconBg: string;
  iconColor: string;
  hoverBorder?: string;
  sub?: string;
}

export interface TrendBulan {
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
  aktif?: boolean;
}

export interface TunggakanData {
  id: string;
  nama: string;
  kelas: string;
  nominal: number;
  durasiBulan: number;
  inisial: string;
  avatarBg: string;
}

export interface TransaksiTerbaru {
  id: string;
  jenis: "pemasukan" | "pengeluaran";
  deskripsi: string;
  kategori: string;
  sumber: string;
  jumlah: number;
  tanggal: string;
  status: "Lunas" | "Proses" | "Dibatalkan";
  ikon?: string;
}

export async function getDashboardKpi(): Promise<KpiData[]> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA", "VIEWER");
  const tenantId = session.user.tenantId;
  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalPemasukanThisMonth,
    totalPengeluaranThisMonth,
    totalPemasukanLastMonth,
    totalPengeluaranLastMonth,
    totalSantriAktif,
  ] = await Promise.all([
    db.transaksi.aggregate({
      _sum: { jumlah: true },
      where: { tenantId, jenis: "PEMASUKAN", tanggal: { gte: startThisMonth }, deletedAt: null },
    }),
    db.transaksi.aggregate({
      _sum: { jumlah: true },
      where: { tenantId, jenis: "PENGELUARAN", tanggal: { gte: startThisMonth }, deletedAt: null },
    }),
    db.transaksi.aggregate({
      _sum: { jumlah: true },
      where: { tenantId, jenis: "PEMASUKAN", tanggal: { gte: startLastMonth, lte: endLastMonth }, deletedAt: null },
    }),
    db.transaksi.aggregate({
      _sum: { jumlah: true },
      where: { tenantId, jenis: "PENGELUARAN", tanggal: { gte: startLastMonth, lte: endLastMonth }, deletedAt: null },
    }),
    db.santri.count({ where: { tenantId, status: "AKTIF", deletedAt: null } }),
  ]);

  const pemasukanThis = Number(totalPemasukanThisMonth._sum.jumlah ?? 0);
  const pengeluaranThis = Number(totalPengeluaranThisMonth._sum.jumlah ?? 0);
  const pemasukanLast = Number(totalPemasukanLastMonth._sum.jumlah ?? 0);
  const pengeluaranLast = Number(totalPengeluaranLastMonth._sum.jumlah ?? 0);
  const saldo = pemasukanThis - pengeluaranThis;

  function delta(thisMonth: number, lastMonth: number): { val: string; tone: "positive" | "negative" | "neutral" } {
    if (lastMonth === 0) return { val: "—", tone: "neutral" };
    const pct = ((thisMonth - lastMonth) / lastMonth) * 100;
    const sign = pct >= 0 ? "+" : "";
    return { val: `${sign}${pct.toFixed(1)}%`, tone: pct >= 0 ? "positive" : "negative" };
  }

  const deltaSaldo = delta(pemasukanThis - pengeluaranThis, pemasukanLast - pengeluaranLast);
  const deltaPengeluaran = delta(pengeluaranThis, pengeluaranLast);

  return [
    {
      label: "Total Saldo Kas",
      nilai: formatRupiah(saldo),
      chip: deltaSaldo.val,
      chipTone: deltaSaldo.tone,
      icon: "wallet",
      iconBg: "bg-primary-fixed-dim/20",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/30",
    },
    {
      label: "Pemasukan Bulan Ini",
      nilai: formatRupiah(pemasukanThis),
      chip: now.toLocaleString("id-ID", { month: "long" }),
      chipTone: "neutral",
      icon: "trending-up",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "Pengeluaran Bulan Ini",
      nilai: formatRupiah(pengeluaranThis),
      chip: deltaPengeluaran.val,
      chipTone: deltaPengeluaran.tone,
      icon: "trending-down",
      iconBg: "bg-error-container/20",
      iconColor: "text-error",
      hoverBorder: "hover:border-error/30",
    },
    {
      label: "Total Santri Aktif",
      nilai: totalSantriAktif.toLocaleString("id-ID"),
      sub: "Santri",
      icon: "users",
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
  ];
}

export async function getTrend6Bulan(): Promise<TrendBulan[]> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA", "VIEWER");
  const tenantId = session.user.tenantId;
  const now = new Date();
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const result: TrendBulan[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const [pemasukanAgg, pengeluaranAgg] = await Promise.all([
      db.transaksi.aggregate({
        _sum: { jumlah: true },
        where: { tenantId, jenis: "PEMASUKAN", tanggal: { gte: d, lt: next }, deletedAt: null },
      }),
      db.transaksi.aggregate({
        _sum: { jumlah: true },
        where: { tenantId, jenis: "PENGELUARAN", tanggal: { gte: d, lt: next }, deletedAt: null },
      }),
    ]);
    result.push({
      bulan: labels[d.getMonth()],
      pemasukan: Math.round(Number(pemasukanAgg._sum.jumlah ?? 0) / 1_000_000 * 10) / 10,
      pengeluaran: Math.round(Number(pengeluaranAgg._sum.jumlah ?? 0) / 1_000_000 * 10) / 10,
      aktif: i === 0,
    });
  }
  return result;
}

export async function getTunggakan(limit = 5): Promise<TunggakanData[]> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA", "VIEWER");
  const tenantId = session.user.tenantId;
  const now = new Date();
  const bulanIni = new Date(now.getFullYear(), now.getMonth(), 1);

  // Cari santri yang punya tunggakan bulan ini atau sebelumnya
  const santriTunggakan = await db.santri.findMany({
    where: {
      tenantId,
      status: "AKTIF",
      deletedAt: null,
      pembayarans: {
        none: { bulan: bulanIni, status: "LUNAS", deletedAt: null },
      },
    },
    include: {
      pembayarans: {
        where: { status: "LUNAS", deletedAt: null },
        orderBy: { bulan: "asc" },
      },
    },
    take: limit,
  });

  return santriTunggakan.map((s) => {
    const durasi = Math.max(0, now.getFullYear() * 12 + now.getMonth() - (s.createdAt.getFullYear() * 12 + s.createdAt.getMonth()) + 1);
    const nominalBulanan = 75_000; // default, seharusnya ambil SppRate per jenjang
    const nominalTunggakan = nominalBulanan * durasi;
    return {
      id: s.id,
      nama: s.nama,
      kelas: `${s.jenjang} - ${s.kelas}`,
      nominal: nominalTunggakan,
      durasiBulan: durasi,
      inisial: s.nama.split(" ").map((k) => k[0] ?? "").slice(0, 2).join("").toUpperCase(),
      avatarBg: "bg-secondary-container",
    };
  });
}

export async function getTransaksiTerbaru(limit = 5): Promise<TransaksiTerbaru[]> {
  const session = await requireRole("SUPER_ADMIN", "BENDAHARA", "VIEWER");
  const tenantId = session.user.tenantId;

  const transaksi = await db.transaksi.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { tanggal: "desc" },
    take: limit,
    include: { kategori: true },
  });

  return transaksi.map((t) => ({
    id: t.id,
    jenis: t.jenis === "PEMASUKAN" ? "pemasukan" : "pengeluaran",
    deskripsi: t.keterangan ?? t.kategori.nama,
    kategori: t.kategori.nama,
    sumber: t.sumber ?? t.kategori.nama,
    jumlah: Number(t.jumlah),
    tanggal: t.tanggal.toISOString().split("T")[0],
    status: t.status === "LUNAS" ? "Lunas" : t.status === "PROSES" ? "Proses" : "Dibatalkan",
    ikon: t.jenis === "PEMASUKAN" ? "school" : "zap",
  }));
}

export async function revalidateDashboard() {
  revalidateTag("dashboard");
}