import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { buildPortalData } from "@/lib/wali-portal";
import WaliPortal from "@/components/features/wali-portal";

export const dynamic = "force-dynamic";

export default async function PortalWaliPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.user.role !== "WALI") redirect("/beranda");

  const santris = await db.santri.findMany({
    where: { waliUserId: s.user.id, deletedAt: null, status: "AKTIF" },
    include: {
      pembayarans: {
        where: { deletedAt: null, status: "LUNAS" },
        orderBy: { bulan: "desc" },
      },
    },
    orderBy: { nama: "asc" },
  });

  if (santris.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-container-low px-4">
        <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-8 text-center shadow-soft">
          <h1 className="text-lg font-bold text-on-surface">Portal Wali Santri</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Akun ini belum terhubung ke santri. Hubungi bendahara TPQ.
          </p>
        </div>
      </main>
    );
  }

  const rates = await db.sppRate.findMany({
    where: { tenantId: s.user.tenantId, deletedAt: null },
    select: { jenjang: true, nominal: true },
  });
  const rateMap = new Map(rates.map((r) => [r.jenjang, Number(r.nominal)]));

  return (
    <main className="min-h-screen bg-surface-container-low px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {santris.map((santri, i) => {
          const sppBulanan = rateMap.get(santri.jenjang) ?? 0;
          const { tunggakan, riwayat } = buildPortalData(santri.pembayarans, sppBulanan);
          return (
            <WaliPortal
              key={santri.id}
              nama={santri.nama}
              noInduk={santri.noInduk}
              kelas={santri.kelas}
              namaWali={santri.namaWali}
              sppBulanan={sppBulanan}
              tunggakan={tunggakan}
              riwayat={riwayat}
              login={i === 0}
              showHeader={i === 0}
            />
          );
        })}
      </div>
    </main>
  );
}
