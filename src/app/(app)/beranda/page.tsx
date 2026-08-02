import {
  KPI_BERANDA,
  TREN_6_BULAN,
  TUNGGAKAN,
  TRANSAKSI_TERBARU,
} from "@/lib/mock-data";
import StatCard from "@/components/features/stat-card";
import FinanceBarChart from "@/components/features/finance-bar-chart";
import ArrearsList from "@/components/features/arrears-list";
import TransaksiTerbaru from "@/components/features/transaksi-terbaru";
import ModalTransaksi from "@/components/features/modal-transaksi";

export default function BerandaPage() {
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-[32px] font-bold leading-10 text-primary md:text-5xl md:leading-[56px]">
          Assalamu&apos;alaikum, Aisyah!
        </h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Berikut adalah ringkasan keuangan TPQ hari ini.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {KPI_BERANDA.map((kpi) => (
          <StatCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Tren + tunggakan */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft lg:col-span-2 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Tren Keuangan</h2>
              <p className="text-sm text-on-surface-variant">
                Pemasukan vs Pengeluaran 6 Bulan Terakhir
              </p>
            </div>
            <select
              aria-label="Periode grafik"
              className="rounded-lg border-none bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20"
              defaultValue="6-bulan"
            >
              <option value="6-bulan">6 Bulan Terakhir</option>
              <option value="tahun">Tahun Ini</option>
            </select>
          </div>
          <FinanceBarChart data={TREN_6_BULAN} periode="Maret - Agustus 2024" />
        </section>

        <ArrearsList items={TUNGGAKAN} />
      </div>

      {/* Transaksi terbaru */}
      <TransaksiTerbaru items={TRANSAKSI_TERBARU} />

      {/* Footer */}
      <footer className="pt-4 text-center text-sm text-on-surface-variant/40">
        © 2024 TPQ Finance · Sistem Keuangan Amanah untuk Lembaga Islami
      </footer>

      <ModalTransaksi />
    </div>
  );
}
