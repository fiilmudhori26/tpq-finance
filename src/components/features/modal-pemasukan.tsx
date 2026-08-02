"use client";

import { X } from "lucide-react";

const KATEGORI = ["SPP Santri", "Donasi/Infaq", "Sewa Aset", "Lainnya"];

export default function ModalPemasukan({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-pemasukan"
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-8 shadow-lift md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="judul-modal-pemasukan" className="text-lg font-semibold text-on-surface">
              Tambah Pemasukan Baru
            </h2>
            <p className="text-sm text-on-surface-variant">
              Pastikan semua data sesuai dengan bukti fisik.
            </p>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <div>
            <label htmlFor="kategori" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Kategori
            </label>
            <select
              id="kategori"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            >
              {KATEGORI.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sumber" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Sumber Dana
            </label>
            <input
              id="sumber"
              type="text"
              required
              placeholder="Nama donatur / sumber"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="jumlah" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Jumlah
              </label>
              <input
                id="jumlah"
                type="number"
                min={0}
                required
                placeholder="Rp"
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm font-bold text-primary tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="tanggal" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Tanggal
              </label>
              <input
                id="tanggal"
                type="date"
                required
                defaultValue="2024-08-16"
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="catatan" className="mb-1 block text-sm font-medium text-on-surface-variant">
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
              onClick={onClose}
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
