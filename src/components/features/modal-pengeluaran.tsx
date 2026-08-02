"use client";

import { useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";

const KATEGORI = ["Operasional", "Gaji/Honor", "Perawatan", "Lain-lain"];

export default function ModalPengeluaran({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-pengeluaran"
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-surface-container-lowest shadow-lift md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-8 pb-0">
          <div>
            <h2 id="judul-modal-pengeluaran" className="text-lg font-semibold text-on-surface">
              Catat Pengeluaran Baru
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
          className="mt-6 space-y-4 p-8 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <div>
            <label htmlFor="tanggal" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Tanggal Transaksi
            </label>
            <input
              id="tanggal"
              type="date"
              required
              defaultValue="2024-08-16"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div>
            <label htmlFor="keterangan" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Keterangan
            </label>
            <textarea
              id="keterangan"
              rows={3}
              required
              placeholder="Rincian pengeluaran"
              className="w-full resize-none rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-on-surface-variant">
              Unggah Bukti
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright px-4 py-8 text-sm text-on-surface-variant transition-colors hover:border-primary hover:bg-primary/5"
            >
              <UploadCloud className="h-8 w-8 text-primary" aria-hidden />
              {fileName || "PNG, JPG up to 10MB"}
            </button>
          </div>

          <div className="flex gap-4 bg-surface-container-low p-4 pt-5">
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
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
