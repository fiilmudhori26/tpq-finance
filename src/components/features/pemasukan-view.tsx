"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, HandCoins, CalendarCheck } from "lucide-react";
import { type TransaksiRow } from "@/lib/data";
import { formatRupiah, formatTanggal } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import CategoryBadge from "@/components/ui/category-badge";
import ActionBar from "./action-bar";
import TableRowMenu from "./table-row-menu";
import ModalPemasukan, { type KategoriOption } from "./modal-pemasukan";
import PaginationBar from "./pagination-bar";

interface Props {
  initialData: TransaksiRow[];
  total: number;
  page: number;
  perPage: number;
  kategoris: KategoriOption[];
}

export default function PemasukanView({ initialData, total, page, perPage, kategoris }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const totalNominal = initialData.reduce((a, t) => a + t.jumlah, 0);
  const infaqTotal = initialData
    .filter((t) => t.kategori.toLowerCase().includes("infaq") || t.kategori.toLowerCase().includes("donasi"))
    .reduce((a, t) => a + t.jumlah, 0);
  const donaturCount = initialData
    .filter((t) => t.kategori.toLowerCase().includes("infaq") || t.kategori.toLowerCase().includes("donasi"))
    .length;

  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);

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
          label="Total Pemasukan (Halaman Ini)"
          value={formatRupiah(totalNominal)}
        />
        <SummaryCard
          icon={HandCoins}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Total Infaq & Sedekah"
          value={formatRupiah(infaqTotal)}
          sub={`Dari ${donaturCount} donatur`}
        />
        <SummaryCard
          icon={CalendarCheck}
          iconBg="bg-tertiary-fixed/20"
          iconColor="text-tertiary"
          label="Total Transaksi"
          value={total.toLocaleString("id-ID")}
          sub="transaksi tercatat"
        />
      </div>

      <ActionBar
        title="Pemasukan"
        periode={new Date().toLocaleString("id-ID", { month: "long", year: "numeric" })}
        onAdd={() => setOpen(true)}
        addLabel="Tambah Pemasukan"
      />

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Riwayat Transaksi</h2>
            <p className="text-sm text-on-surface-variant">
              Menampilkan {initialData.length} dari {total} transaksi
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
              {initialData.map((t) => (
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
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data pemasukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar total={total} page={current} perPage={perPage} basePath="/pemasukan" />
      </Card>

      <ModalPemasukan
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
