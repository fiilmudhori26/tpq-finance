"use client";

import { useState } from "react";
import { TrendingUp, PieChart, Clock, Plus } from "lucide-react";
import { PENGELUARAN } from "@/lib/mock-transaksi";
import { formatRupiah, formatTanggal } from "@/lib/format";
import Card from "@/components/ui/card";
import CategoryBadge from "@/components/ui/category-badge";
import ActionBar from "./action-bar";
import TableRowMenu from "./table-row-menu";
import ModalPengeluaran from "./modal-pengeluaran";

function BentoCard({
  icon: Icon,
  blob,
  label,
  value,
  footer,
  footerTone = "text-on-surface-variant",
}: {
  icon: typeof TrendingUp;
  blob: string;
  label: string;
  value: string;
  footer: string;
  footerTone?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft transition-transform hover:-translate-y-1">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${blob}`} aria-hidden />
      <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-on-surface md:text-3xl">{value}</p>
      <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${footerTone}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden /> {footer}
      </p>
    </div>
  );
}

export default function PengeluaranView() {
  const [open, setOpen] = useState(false);
  const total = PENGELUARAN.reduce((a, t) => a + t.jumlah, 0);

  const kategoriTerbesar = PENGELUARAN.reduce<Record<string, number>>((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] ?? 0) + t.jumlah;
    return acc;
  }, {});
  const [topKategori, topJumlah] =
    Object.entries(kategoriTerbesar).sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const porsi = total ? Math.round((topJumlah / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Manajemen Pengeluaran</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Pantau dan kelola semua biaya operasional TPQ secara transparan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" aria-hidden /> Tambah Pengeluaran
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <BentoCard
          icon={TrendingUp}
          blob="bg-primary/5"
          label="Total Bulan Ini"
          value={formatRupiah(total)}
          footer="+12.5% vs bulan lalu"
          footerTone="text-error"
        />
        <BentoCard
          icon={PieChart}
          blob="bg-secondary/5"
          label="Kategori Terbesar"
          value={topKategori}
          footer={`${porsi}% dari total pengeluaran`}
          footerTone="text-primary"
        />
        <BentoCard
          icon={Clock}
          blob="bg-error/5"
          label="Sisa Anggaran Ops"
          value={formatRupiah(1_750_000)}
          footer="Berakhir dalam 12 hari"
        />
      </div>

      <ActionBar
        title="Pengeluaran"
        periode="Agustus 2024"
        onAdd={() => setOpen(true)}
        addLabel="Tambah Pengeluaran"
      />

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Riwayat Pengeluaran</h2>
            <p className="text-sm text-on-surface-variant">
              Menampilkan {PENGELUARAN.length} transaksi terakhir
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
                <th className="px-6 py-4 font-medium">Bukti</th>
                <th className="px-6 py-4 text-right font-medium">Jumlah</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {PENGELUARAN.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-primary/5">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm font-bold text-on-surface">{formatTanggal(t.tanggal)}</p>
                    <p className="text-xs text-on-surface-variant">10:00 WIB</p>
                  </td>
                  <td className="px-6 py-4">
                    <CategoryBadge kategori={t.kategori} />
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-on-surface">
                    {t.deskripsi}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-lg text-on-surface-variant transition-shadow hover:ring-2 hover:ring-primary"
                      role="img"
                      aria-label="Bukti transaksi"
                    >
                      🧾
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-bold tabular-nums text-on-surface">
                    {formatRupiah(t.jumlah)}
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
          <p>Menampilkan 1-{PENGELUARAN.length} dari {PENGELUARAN.length} transaksi</p>
        </div>
      </Card>

      <ModalPengeluaran open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
