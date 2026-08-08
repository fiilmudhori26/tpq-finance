import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { buildPortalData } from "@/lib/wali-portal";
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

  const rate = await db.sppRate.findFirst({
    where: { tenantId: waliToken.tenantId, jenjang: santri.jenjang, deletedAt: null },
    select: { nominal: true },
  });

  const { sppBulanan, tunggakan, riwayat } = buildPortalData(
    santri.pembayarans,
    Number(rate?.nominal ?? 0)
  );

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
