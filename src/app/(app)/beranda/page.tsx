import { Suspense } from "react";
import { getDashboardData } from "@/lib/data";
import { getSession } from "@/lib/session";
import StatCard from "@/components/features/stat-card";
import FinanceBarChart from "@/components/features/finance-bar-chart";
import ArrearsList from "@/components/features/arrears-list";
import TransaksiTerbaru from "@/components/features/transaksi-terbaru";
import ModalTransaksi from "@/components/features/modal-transaksi";

export default async function BerandaPage() {
  const [dashData, session] = await Promise.all([getDashboardData(), getSession()]);
  const { kpi, trend, tunggakan, transaksiTerbaru } = dashData;
  const namaUser = session?.user.name ?? "Bendahara";

  const bulanLabel = new Date().toLocaleString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-bold leading-10 text-primary md:text-5xl md:leading-[56px]">
          Assalamu&apos;alaikum, {namaUser}!
        </h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Ringkasan keuangan TPQ — {bulanLabel}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpi.map((kpiItem) => (
          <StatCard key={kpiItem.label} kpi={kpiItem} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft lg:col-span-2 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Tren Keuangan</h2>
              <p className="text-sm text-on-surface-variant">
                Pemasukan vs Pengeluaran 6 Bulan Terakhir
              </p>
            </div>
          </div>
          <FinanceBarChart data={trend} periode="6 Bulan Terakhir" />
        </section>

        <ArrearsList items={tunggakan} />
      </div>

      <TransaksiTerbaru items={transaksiTerbaru} />

      <footer className="pt-4 text-center text-sm text-on-surface-variant/40">
        © {new Date().getFullYear()} TPQ Finance · Sistem Keuangan Amanah untuk Lembaga Islami
      </footer>

      <Suspense>
        <ModalTransaksi />
      </Suspense>
    </div>
  );
}
