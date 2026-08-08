import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import WaliPortal from "@/components/features/wali-portal";

export const dynamic = "force-dynamic";

export default async function WaliPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const waliToken = await db.waliToken.findFirst({
    where: { token, aktif: true },
    include: {
      santri: {
        include: {
          pembayarans: {
            where: { deletedAt: null, status: "LUNAS" },
            orderBy: { bulan: "desc" },
          },
        },
      },
    },
  });
  if (!waliToken) notFound();

  const santri = waliToken.santri;

  // Tarif SPP santri
  const rate = await db.sppRate.findFirst({
    where: { tenantId: waliToken.tenantId, jenjang: santri.jenjang, deletedAt: null },
    select: { nominal: true },
  });
  const sppBulanan = Number(rate?.nominal ?? 0);

  const now = new Date();
  const bulanIni = new Date(now.getFullYear(), now.getMonth(), 1);

  const lunasSet = new Set(
    santri.pembayarans.map((p) => `${p.bulan.getFullYear()}-${String(p.bulan.getMonth() + 1).padStart(2, "0")}`)
  );

  // Tunggakan: bulan dari Juli tahun ajaran s/d bulan lalu
  const tahunAjar = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const bulanAwal = new Date(tahunAjar, 6, 1);
  const tunggakan: string[] = [];
  for (let d = new Date(bulanAwal); d < bulanIni; d.setMonth(d.getMonth() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!lunasSet.has(key)) tunggakan.push(key);
  }

  const riwayat = santri.pembayarans.map((p) => ({
    noReferensi: p.noReferensi,
    bulan: `${p.bulan.getFullYear()}-${String(p.bulan.getMonth() + 1).padStart(2, "0")}`,
    tanggal: p.paidAt.toISOString(),
    nominal: Number(p.nominal),
    metode: p.metode,
  }));

  return (
    <WaliPortal
      nama={santri.nama}
      noInduk={santri.noInduk}
      kelas={santri.kelas}
      namaWali={santri.namaWali}
      sppBulanan={sppBulanan}
      tunggakan={tunggakan}
      riwayat={riwayat}
    />
  );
}
