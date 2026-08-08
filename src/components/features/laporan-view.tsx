"use client";

import { Download } from "lucide-react";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import FinanceBarChart from "@/components/features/finance-bar-chart";
import CategoryBadge from "@/components/ui/category-badge";
import StatusBadge from "@/components/ui/status-badge";
import type { TrendBulan } from "@/lib/data";

export interface LaporanProps {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  trend: TrendBulan[];
  rekap: { kategori: string; jumlah: number; jenis: string }[];
  tunggakanCount: number;
  totalSantri: number;
}

export default function LaporanView({
  totalMasuk,
  totalKeluar,
  saldo,
  trend,
  rekap,
  tunggakanCount,
  totalSantri,
}: LaporanProps) {
  const lunas = totalSantri - tunggakanCount;

  const exportCsv = () => {
    const rows = [
      ["Kategori", "Jenis", "Jumlah (Rp)"],
      ...rekap.map((r) => [r.kategori, r.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran", r.jumlah]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(";")).join("\n"); // BOM utk Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Laporan Keuangan</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ringkasan arus kas TPQ — periode berjalan.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
        >
          <Download className="h-4 w-4" aria-hidden /> Export CSV
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Saldo Kas"
          value={formatRupiah(saldo)}
        />
        <SummaryCard
          icon={TrendingUp}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Total Pemasukan"
          value={formatRupiah(totalMasuk)}
          sub={`${rekap.filter((r) => r.jenis === "PEMASUKAN").length} kategori`}
        />
        <SummaryCard
          icon={TrendingDown}
          iconBg="bg-error/10"
          iconColor="text-error"
          label="Total Pengeluaran"
          value={formatRupiah(totalKeluar)}
          sub={`${rekap.filter((r) => r.jenis === "PENGELUARAN").length} kategori`}
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Pemasukan vs Pengeluaran</h2>
            <p className="text-sm text-on-surface-variant">6 bulan terakhir</p>
          </div>
        </div>
        <FinanceBarChart data={trend} periode="6 bulan terakhir" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="border-b border-outline-variant/20 px-6 py-5">
            <h2 className="text-lg font-semibold text-on-surface">Rekap per Kategori</h2>
            <p className="text-sm text-on-surface-variant">Pemasukan & pengeluaran periode berjalan</p>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {rekap.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-on-surface-variant">
                Belum ada transaksi.
              </p>
            )}
            {rekap.map((r) => (
              <div
                key={r.kategori}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <CategoryBadge kategori={r.kategori} />
                  <span className="text-xs uppercase text-on-surface-variant">{r.jenis}</span>
                </div>
                <span className="font-bold tabular-nums text-on-surface">
                  {formatRupiah(r.jumlah)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-b border-outline-variant/20 px-6 py-5">
            <h2 className="text-lg font-semibold text-on-surface">Status Pembayaran SPP</h2>
            <p className="text-sm text-on-surface-variant">Bulan berjalan</p>
          </div>
          <div className="divide-y divide-outline-variant/20">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <StatusBadge status="Lunas" dot />
                <span className="text-sm text-on-surface-variant">Santri lunas bulan ini</span>
              </div>
              <span className="font-bold tabular-nums text-on-surface">
                {lunas} santri
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <StatusBadge status="Tunggakan" dot />
                <span className="text-sm text-on-surface-variant">Perlu ditagih</span>
              </div>
              <span className="flex items-center gap-1.5 font-bold tabular-nums text-error">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                {tunggakanCount} santri
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-surface-container-low px-6 py-4">
              <span className="text-sm font-medium text-on-surface">Tingkat ketertiban</span>
              <span className="font-bold tabular-nums text-primary">
                {totalSantri === 0 ? "—" : `${Math.round((lunas / totalSantri) * 100)}%`}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
