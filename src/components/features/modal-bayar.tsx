"use client";

import { useState } from "react";
import { X, Wallet } from "lucide-react";
import { BULAN_2024, type SantriPembayaran } from "@/lib/mock-pembayaran";
import { formatRupiah } from "@/lib/format";

export default function ModalBayar({
  open,
  onClose,
  data,
  bulanBelum,
}: {
  open: boolean;
  onClose: () => void;
  data: SantriPembayaran;
  bulanBelum: string[];
}) {
  const [bulan, setBulan] = useState("");
  if (!open) return null;

  const bulanIdx = bulan ? Number(bulan.split("-")[1]) - 1 : -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-bayar"
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-8 shadow-lift md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="judul-modal-bayar" className="text-lg font-semibold text-on-surface">
            Konfirmasi Pembayaran
          </h2>
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
          <div className="rounded-2xl bg-surface-container-low p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">
              Santri
            </p>
            <p className="mt-0.5 font-bold text-on-surface">{data.nama}</p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-bright px-4 py-3">
              <span className="text-sm text-on-surface-variant">SPP Bulanan</span>
              <span className="font-bold text-primary tabular-nums">
                {formatRupiah(data.sppBulanan)}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="bulan-bayar" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Bayar Bulan
            </label>
            <select
              id="bulan-bayar"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              required
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <option value="">Pilih bulan...</option>
              {bulanBelum.map((b) => (
                <option key={b} value={b}>
                  {BULAN_2024[Number(b.split("-")[1]) - 1]} 2024
                </option>
              ))}
            </select>
          </div>

          {bulanIdx >= 0 && (
            <div className="rounded-2xl bg-primary/5 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-on-surface-variant">
                Total Bayar
              </p>
              <p className="text-3xl font-bold text-primary tabular-nums">
                {formatRupiah(data.sppBulanan)}
              </p>
            </div>
          )}

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
              disabled={!bulan}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Wallet className="h-4 w-4" aria-hidden />
              Bayar Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
