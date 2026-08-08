"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, PieChart, TrendingDown } from "lucide-react";
import { type TransaksiRow } from "@/lib/data";
import { formatRupiah, formatTanggal } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import CategoryBadge from "@/components/ui/category-badge";
import ActionBar from "./action-bar";
import TableRowMenu from "./table-row-menu";
import ModalPengeluaran, { type KategoriOption } from "./modal-pengeluaran";
import PaginationBar from "./pagination-bar";

interface Props {
  initialData: TransaksiRow[];
  total: number;
  page: number;
  perPage: number;
  kategoris: KategoriOption[];
}

export default function PengeluaranView({ initialData, total, page, perPage, kategoris }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const totalNominal = initialData.reduce((a, t) => a + t.jumlah, 0);
  const kategoriTerbesar = initialData.reduce<Record<string, number>>((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] ?? 0) + t.jumlah;
    return acc;
  }, {});
  const [topKategori, topJumlah] =
    Object.entries(kategoriTerbesar).sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const porsi = totalNominal ? Math.round((topJumlah / totalNominal) * 100) : 0;

  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Manajemen Pengeluaran</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Pantau dan kelola semua biaya operasional TPQ secara transparan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          iconBg="bg-error/10"
          iconColor="text-error"
          label="Total Pengeluaran (Halaman Ini)"
          value={formatRupiah(totalNominal)}
        />
        <SummaryCard
          icon={PieChart}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Kategori Terbesar"
          value={topKategori}
          sub={`${porsi}% dari total pengeluaran`}
        />
        <SummaryCard
          icon={TrendingDown}
          iconBg="bg-tertiary-fixed/20"
          iconColor="text-tertiary"
          label="Total Transaksi"
          value={total.toLocaleString("id-ID")}
          sub="transaksi tercatat"
        />
      </div>

      <ActionBar
        title="Pengeluaran"
        periode={new Date().toLocaleString("id-ID", { month: "long", year: "numeric" })}
        onAdd={() => setOpen(true)}
        addLabel="Tambah Pengeluaran"
      />

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Riwayat Pengeluaran</h2>
            <p className="text-sm text-on-surface-variant">
              Menampilkan {initialData.length} dari {total} transaksi
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
              {initialData.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-primary/5">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm font-bold text-on-surface">{formatTanggal(t.tanggal)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <CategoryBadge kategori={t.kategori} />
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-on-surface">
                    {t.deskripsi}
                  </td>
                  <td className="px-6 py-4">
                    {t.buktiUrl ? (
                      <a
                        href={t.buktiUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Lihat bukti nota"
                      >
                        <img
                          src={t.buktiUrl}
                          alt={`Bukti nota ${t.deskripsi}`}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-outline-variant transition-shadow hover:ring-2 hover:ring-primary"
                        />
                      </a>
                    ) : (
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-lg text-on-surface-variant"
                        role="img"
                        aria-label="Tanpa bukti"
                      >
                        🧾
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-bold tabular-nums text-error">
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="px-6 py-4">
                    <TableRowMenu onEdit={() => setOpen(true)} onDelete={() => {}} />
                  </td>
                </tr>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data pengeluaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar total={total} page={current} perPage={perPage} basePath="/pengeluaran" />
      </Card>

      <ModalPengeluaran
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
        kategoris={kategoris}
      />
    </div>
  );
}
