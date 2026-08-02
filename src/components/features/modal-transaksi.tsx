"use client";

import { useState } from "react";
import { X } from "lucide-react";

const KATEGORI_PEMASUKAN = ["SPP Santri", "Donasi/Infaq", "Sewa Aset", "Lainnya"];
const KATEGORI_PENGELUARAN = ["Operasional", "Gaji/Honor", "Perawatan", "Lain-lain"];

export default function ModalTransaksi() {
  const [open, setOpen] = useState(false);
  const [jenis, setJenis] = useState<"pemasukan" | "pengeluaran">("pemasukan");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tambah transaksi"
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow-2xl transition-transform active:scale-95 md:hidden"
      >
        +
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-transaksi"
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 backdrop-blur-sm md:items-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-8 shadow-lift md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="judul-modal-transaksi" className="text-lg font-semibold text-on-surface">
            Tambah Transaksi
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2" role="tablist" aria-label="Jenis transaksi">
          {(["pemasukan", "pengeluaran"] as const).map((j) => (
            <button
              key={j}
              type="button"
              role="tab"
              aria-selected={jenis === j}
              onClick={() => setJenis(j)}
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition-colors ${
                jenis === j
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="kategori"
              className="mb-1 block text-sm font-medium text-on-surface-variant"
            >
              Kategori
            </label>
            <select
              id="kategori"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            >
              {(jenis === "pemasukan" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN).map(
                (k) => (
                  <option key={k}>{k}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="sumber"
              className="mb-1 block text-sm font-medium text-on-surface-variant"
            >
              Sumber Dana
            </label>
            <input
              id="sumber"
              type="text"
              placeholder="Nama donatur / sumber"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="jumlah"
                className="mb-1 block text-sm font-medium text-on-surface-variant"
              >
                Jumlah
              </label>
              <input
                id="jumlah"
                type="number"
                min={0}
                placeholder="Rp"
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm font-bold text-primary tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="tanggal"
                className="mb-1 block text-sm font-medium text-on-surface-variant"
              >
                Tanggal
              </label>
              <input
                id="tanggal"
                type="date"
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="catatan"
              className="mb-1 block text-sm font-medium text-on-surface-variant"
            >
              Catatan
            </label>
            <textarea
              id="catatan"
              rows={3}
              placeholder="Catatan tambahan (opsional)"
              className="w-full resize-none rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-outline-variant bg-white py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
