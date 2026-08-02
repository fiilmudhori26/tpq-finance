"use client";

import { useState } from "react";
import { Wallet, HandCoins, CalendarCheck } from "lucide-react";
import { PEMASUKAN } from "@/lib/mock-transaksi";
import { formatRupiah, formatTanggal } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import CategoryBadge from "@/components/ui/category-badge";
import ActionBar from "./action-bar";
import TableRowMenu from "./table-row-menu";
import ModalPemasukan from "./modal-pemasukan";

export default function PemasukanView() {
  const [open, setOpen] = useState(false);
  const total = PEMASUKAN.reduce((a, t) => a + t.jumlah, 0);
  const infaq = PEMASUKAN.filter((t) => ["Infaq", "Donasi"].includes(t.kategori)).reduce(
    (a, t) => a + t.jumlah,
    0
  );
  const donatur = PEMASUKAN.filter((t) => ["Infaq", "Donasi"].includes(t.kategori)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Manajemen Pemasukan</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Catat dan pantau semua pemasukan kas TPQ secara transparan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Total Pemasukan Bulan Ini"
          value={formatRupiah(total)}
          chip="+12%"
          chipTone="positive"
        />
        <SummaryCard
          icon={HandCoins}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Total Infaq & Sedekah"
          value={formatRupiah(infaq)}
          sub={`Dari ${donatur} donatur bulan ini`}
        />
        <SummaryCard
          icon={CalendarCheck}
          iconBg="bg-tertiary-fixed/20"
          iconColor="text-tertiary"
          label="Pembayaran SPP Lunas"
          value="92%"
          progress={92}
        />
      </div>

      <ActionBar
        title="Pemasukan"
        periode="Agustus 2024"
        onAdd={() => setOpen(true)}
        addLabel="Tambah Pemasukan"
      />

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Riwayat Transaksi</h2>
            <p className="text-sm text-on-surface-variant">
              Menampilkan {PEMASUKAN.length} transaksi terakhir
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Sumber</th>
                <th className="px-6 py-4 text-right font-medium">Jumlah</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Catatan</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {PEMASUKAN.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-primary/5">
                  <td className="px-6 py-4">
                    <CategoryBadge kategori={t.kategori} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-on-surface">
                    {t.sumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-primary tabular-nums">
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-on-surface-variant tabular-nums">
                    {formatTanggal(t.tanggal)}
                  </td>
                  <td className="max-w-[180px] truncate px-6 py-4 text-sm italic text-on-surface-variant">
                    {t.catatan || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <TableRowMenu onEdit={() => setOpen(true)} onDelete={() => {}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
          <p>Menampilkan 1-{PEMASUKAN.length} dari {PEMASUKAN.length} transaksi</p>
        </div>
      </Card>

      <ModalPemasukan open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
