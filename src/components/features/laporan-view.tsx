"use client";

import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { PEMASUKAN, PENGELUARAN } from "@/lib/mock-transaksi";
import { TREN_6_BULAN } from "@/lib/mock-data";
import { SANTRI } from "@/lib/mock-santri";
import { formatRupiah } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import FinanceBarChart from "@/components/features/finance-bar-chart";
import CategoryBadge from "@/components/ui/category-badge";
import StatusBadge from "@/components/ui/status-badge";

export default function LaporanView() {
  const totalMasuk = PEMASUKAN.reduce((a, t) => a + t.jumlah, 0);
  const totalKeluar = PENGELUARAN.reduce((a, t) => a + t.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;
  const tunggakan = SANTRI.filter((s) => s.statusSpp === "Tunggakan").length;

  const perKategori = [...PEMASUKAN, ...PENGELUARAN].reduce<
    Record<string, { kategori: string; jumlah: number; jenis: string }>
  >((acc, t) => {
    acc[t.kategori] = acc[t.kategori] ?? { kategori: t.kategori, jumlah: 0, jenis: t.jenis };
    acc[t.kategori].jumlah += t.jumlah;
    return acc;
  }, {});

  const rekap = Object.values(perKategori).sort((a, b) => b.jumlah - a.jumlah);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Laporan Keuangan</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Ringkasan arus kas TPQ Al-Ikhlas periode Agustus 2024.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Saldo Kas"
          value={formatRupiah(saldo)}
          chip="+2.4%"
          chipTone="positive"
        />
        <SummaryCard
          icon={TrendingUp}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Total Pemasukan"
          value={formatRupiah(totalMasuk)}
          sub="6 transaksi"
        />
        <SummaryCard
          icon={TrendingDown}
          iconBg="bg-error/10"
          iconColor="text-error"
          label="Total Pengeluaran"
          value={formatRupiah(totalKeluar)}
          sub="6 transaksi"
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Pemasukan vs Pengeluaran</h2>
            <p className="text-sm text-on-surface-variant">6 bulan terakhir</p>
          </div>
        </div>
        <FinanceBarChart data={TREN_6_BULAN} periode="Maret - Agustus 2024" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="border-b border-outline-variant/20 px-6 py-5">
            <h2 className="text-lg font-semibold text-on-surface">Rekap per Kategori</h2>
            <p className="text-sm text-on-surface-variant">Pemasukan & pengeluaran Agustus 2024</p>
          </div>
          <div className="divide-y divide-outline-variant/20">
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
            <p className="text-sm text-on-surface-variant">Agustus 2024</p>
          </div>
          <div className="divide-y divide-outline-variant/20">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <StatusBadge status="Lunas" dot />
                <span className="text-sm text-on-surface-variant">Santri lunas bulan ini</span>
              </div>
              <span className="font-bold tabular-nums text-on-surface">
                {SANTRI.length - tunggakan} santri
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <StatusBadge status="Tunggakan" dot />
                <span className="text-sm text-on-surface-variant">Perlu ditagih</span>
              </div>
              <span className="flex items-center gap-1.5 font-bold tabular-nums text-error">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                {tunggakan} santri
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-surface-container-low px-6 py-4">
              <span className="text-sm font-medium text-on-surface">Tingkat ketertiban</span>
              <span className="font-bold tabular-nums text-primary">
                {Math.round(((SANTRI.length - tunggakan) / SANTRI.length) * 100)}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
