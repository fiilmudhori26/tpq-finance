import { cache } from "react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatRupiah } from "@/lib/format";

export interface SantriRow {
  id: string;
  noInduk: string;
  nama: string;
  jenjang: string;
  kelas: string;
  wali: string;
  noHp: string;
  statusSpp: "Lunas" | "Tunggakan";
  tanggalMasuk: string;
}

export interface TransaksiRow {
  id: string;
  jenis: "pemasukan" | "pengeluaran";
  deskripsi: string;
  kategori: string;
  sumber: string;
  jumlah: number;
  tanggal: string;
  status: "Lunas" | "Proses" | "Dibatalkan";
  catatan?: string;
  ikon?: string;
}

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

async function getTenantId() {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  return s.user.tenantId;
}

export const getSantriList = cache(async (params: {
  jenjang?: string;
  kelas?: string;
  status?: string;
  q?: string;
  page: number;
  perPage: number;
}) => {
  const tenantId = await getTenantId();
  const { jenjang, kelas, status, q, page, perPage } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { tenantId, deletedAt: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (jenjang) where.jenjang = jenjang as any;
  if (kelas) where.kelas = kelas;
  if (status) where.status = status === "Tunggakan" ? "AKTIF" : "AKTIF"; // status SPP dihitung terpisah
  if (q) {
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { noInduk: { contains: q } },
      { namaWali: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    db.santri.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.santri.count({ where }),
  ]);

  // Hitung status SPP per santri (lunas/tunggakan bulan ini)
  const bulanIni = new Date();
  bulanIni.setDate(1);
  bulanIni.setHours(0, 0, 0, 0);

  const pembayarans = await db.pembayaran.findMany({
    where: {
      tenantId,
      santriId: { in: rows.map((r) => r.id) },
      bulan: bulanIni,
      deletedAt: null,
    },
    select: { santriId: true, status: true },
  });
  const sppMap = new Map(pembayarans.map((p) => [p.santriId, p.status]));

  const data: SantriRow[] = rows.map((s) => ({
    id: s.id,
    noInduk: s.noInduk,
    nama: s.nama,
    jenjang: s.jenjang,
    kelas: s.kelas,
    wali: s.namaWali ?? "-",
    noHp: s.noHpWali ?? "-",
    statusSpp: sppMap.get(s.id) === "LUNAS" ? "Lunas" : "Tunggakan",
    tanggalMasuk: s.createdAt.toISOString(),
  }));

  return { data, total };
});

export const getSantriById = cache(async (id: string) => {
  const tenantId = await getTenantId();
  const s = await db.santri.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      pembayarans: {
        where: { deletedAt: null },
        orderBy: { bulan: "asc" },
      },
    },
  });
  if (!s) return null;

  const bulanIni = new Date();
  bulanIni.setDate(1);
  bulanIni.setHours(0, 0, 0, 0);

  const lunasBulan = s.pembayarans.filter((p) => p.bulan >= bulanIni && p.status === "LUNAS").length;
  const tunggakanBulan = s.pembayarans.filter((p) => p.bulan <= bulanIni && p.status !== "LUNAS").length;

  return {
    id: s.id,
    noInduk: s.noInduk,
    nama: s.nama,
    jenjang: s.jenjang,
    kelas: s.kelas,
    wali: s.namaWali ?? "-",
    noHp: s.noHpWali ?? "-",
    statusSpp: tunggakanBulan > 0 ? "Tunggakan" : "Lunas",
    tanggalMasuk: s.createdAt.toISOString(),
    lunasBulan,
    tunggakanBulan,
    sppBulanan: 75_000, // default, TODO: ambil dari SppRate per jenjang
  };
});

export const getTransaksiList = cache(async (params: {
  jenis?: "pemasukan" | "pengeluaran";
  page: number;
  perPage: number;
  kategoriId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const tenantId = await getTenantId();
  const { jenis, page, perPage, kategoriId, startDate, endDate } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { tenantId, deletedAt: null };
  if (jenis) where.jenis = jenis === "pemasukan" ? "PEMASUKAN" : "PENGELUARAN";
  if (kategoriId) where.kategoriId = kategoriId;
  if (startDate || endDate) {
    where.tanggal = {};
    if (startDate) where.tanggal.gte = startDate;
    if (endDate) where.tanggal.lte = endDate;
  }

  const [rows, total] = await Promise.all([
    db.transaksi.findMany({
      where,
      orderBy: { tanggal: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { kategori: true },
    }),
    db.transaksi.count({ where }),
  ]);

  const data: TransaksiRow[] = rows.map((t) => ({
    id: t.id,
    jenis: t.jenis === "PEMASUKAN" ? "pemasukan" : "pengeluaran",
    deskripsi: t.keterangan ?? t.kategori.nama,
    kategori: t.kategori.nama,
    sumber: t.sumber ?? t.kategori.nama,
    jumlah: Number(t.jumlah),
    tanggal: t.tanggal.toISOString().split("T")[0],
    status: t.status === "LUNAS" ? "Lunas" : t.status === "PROSES" ? "Proses" : "Dibatalkan",
    catatan: t.keterangan ?? undefined,
    ikon: t.jenis === "PEMASUKAN" ? "school" : "zap",
  }));

  return { data, total };
});

export const getKategoriList = cache(async (jenis?: "PEMASUKAN" | "PENGELUARAN") => {
  const tenantId = await getTenantId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { tenantId, deletedAt: null };
  if (jenis) where.jenis = jenis;
  return db.kategori.findMany({ where, orderBy: { nama: "asc" } });
});

export const getSppRates = cache(async () => {
  const tenantId = await getTenantId();
  return db.sppRate.findMany({ where: { tenantId, deletedAt: null }, orderBy: { jenjang: "asc" } });
});

export const getDashboardData = cache(async () => {
  const tenantId = await getTenantId();
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
    db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PEMASUKAN", tanggal: { gte: startThisMonth }, deletedAt: null } }),
    db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PENGELUARAN", tanggal: { gte: startThisMonth }, deletedAt: null } }),
    db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PEMASUKAN", tanggal: { gte: startLastMonth, lte: endLastMonth }, deletedAt: null } }),
    db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PENGELUARAN", tanggal: { gte: startLastMonth, lte: endLastMonth }, deletedAt: null } }),
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

  const kpi: KpiData[] = [
    { label: "Total Saldo Kas", nilai: formatRupiah(saldo), chip: deltaSaldo.val, chipTone: deltaSaldo.tone, icon: "wallet", iconBg: "bg-primary-fixed-dim/20", iconColor: "text-primary", hoverBorder: "hover:border-primary/30" },
    { label: "Pemasukan Bulan Ini", nilai: formatRupiah(pemasukanThis), chip: now.toLocaleString("id-ID", { month: "long" }), chipTone: "neutral", icon: "trending-up", iconBg: "bg-secondary/10", iconColor: "text-secondary" },
    { label: "Pengeluaran Bulan Ini", nilai: formatRupiah(pengeluaranThis), chip: deltaPengeluaran.val, chipTone: deltaPengeluaran.tone, icon: "trending-down", iconBg: "bg-error-container/20", iconColor: "text-error", hoverBorder: "hover:border-error/30" },
    { label: "Total Santri Aktif", nilai: totalSantriAktif.toLocaleString("id-ID"), sub: "Santri", icon: "users", iconBg: "bg-tertiary/10", iconColor: "text-tertiary" },
  ];

  // Trend 6 bulan
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const trend: TrendBulan[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const [pemasukanAgg, pengeluaranAgg] = await Promise.all([
      db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PEMASUKAN", tanggal: { gte: d, lt: next }, deletedAt: null } }),
      db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PENGELUARAN", tanggal: { gte: d, lt: next }, deletedAt: null } }),
    ]);
    trend.push({
      bulan: labels[d.getMonth()],
      pemasukan: Math.round(Number(pemasukanAgg._sum.jumlah ?? 0) / 1_000_000 * 10) / 10,
      pengeluaran: Math.round(Number(pengeluaranAgg._sum.jumlah ?? 0) / 1_000_000 * 10) / 10,
      aktif: i === 0,
    });
  }

  // Tunggakan
  const bulanIni = new Date(now.getFullYear(), now.getMonth(), 1);
  const santriTunggakan = await db.santri.findMany({
    where: {
      tenantId,
      status: "AKTIF",
      deletedAt: null,
      pembayarans: { none: { bulan: bulanIni, status: "LUNAS", deletedAt: null } },
    },
    include: { pembayarans: { where: { status: "LUNAS", deletedAt: null }, orderBy: { bulan: "asc" } } },
    take: 5,
  });
  const tunggakan: TunggakanData[] = santriTunggakan.map((s) => {
    const durasi = Math.max(0, now.getFullYear() * 12 + now.getMonth() - (s.createdAt.getFullYear() * 12 + s.createdAt.getMonth()) + 1);
    const nominalBulanan = 75_000;
    return {
      id: s.id,
      nama: s.nama,
      kelas: `${s.jenjang} - ${s.kelas}`,
      nominal: nominalBulanan * durasi,
      durasiBulan: durasi,
      inisial: s.nama.split(" ").map((k) => k[0] ?? "").slice(0, 2).join("").toUpperCase(),
      avatarBg: "bg-secondary-container",
    };
  });

  // Transaksi terbaru
  const transaksi = await db.transaksi.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { tanggal: "desc" },
    take: 5,
    include: { kategori: true },
  });
  const transaksiTerbaru: TransaksiRow[] = transaksi.map((t) => ({
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

  return { kpi, trend, tunggakan, transaksiTerbaru };
});

export const getLaporanData = cache(async () => {
  const tenantId = await getTenantId();

  const [pemasukanAgg, pengeluaranAgg, santri] = await Promise.all([
    db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PEMASUKAN", deletedAt: null } }),
    db.transaksi.aggregate({ _sum: { jumlah: true }, where: { tenantId, jenis: "PENGELUARAN", deletedAt: null } }),
    db.santri.findMany({ where: { tenantId, status: "AKTIF", deletedAt: null } }),
  ]);

  const totalMasuk = Number(pemasukanAgg._sum.jumlah ?? 0);
  const totalKeluar = Number(pengeluaranAgg._sum.jumlah ?? 0);
  const saldo = totalMasuk - totalKeluar;

  // Rekap per kategori
  const transaksiAll = await db.transaksi.findMany({
    where: { tenantId, deletedAt: null },
    include: { kategori: true },
  });
  const perKategori = transaksiAll.reduce<Record<string, { kategori: string; jumlah: number; jenis: string }>>((acc, t) => {
    acc[t.kategori.nama] = acc[t.kategori.nama] ?? { kategori: t.kategori.nama, jumlah: 0, jenis: t.jenis };
    acc[t.kategori.nama].jumlah += Number(t.jumlah);
    return acc;
  }, {});
  const rekap = Object.values(perKategori).sort((a, b) => b.jumlah - a.jumlah);

  // Status SPP
  const bulanIni = new Date();
  bulanIni.setDate(1);
  bulanIni.setHours(0, 0, 0, 0);
  const tunggakanCount = await db.santri.count({
    where: {
      tenantId,
      status: "AKTIF",
      deletedAt: null,
      pembayarans: { none: { bulan: bulanIni, status: "LUNAS", deletedAt: null } },
    },
  });

  return {
    totalMasuk,
    totalKeluar,
    saldo,
    rekap,
    tunggakanCount,
    totalSantri: santri.length,
  };
});