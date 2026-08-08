"use client";

import { useState, useTransition } from "react";
import { X, Wallet } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { catatPembayaranSpp } from "@/actions/pembayaran";

const BULAN_2024 = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default function ModalBayar({
  open,
  onClose,
  santri,
  bulanBelum,
}: {
  open: boolean;
  onClose: () => void;
  santri: { id: string; nama: string; sppBulanan: number };
  bulanBelum: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [metode, setMetode] = useState<"TUNAI" | "TRANSFER">("TUNAI");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const toggle = (b: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  };

  const total = selected.size * santri.sppBulanan;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.size === 0) return;

    startTransition(async () => {
      const bulanDate = [...selected].map((b) => {
        const [y, m] = b.split("-");
        return new Date(Number(y), Number(m) - 1, 1);
      });

      const res = await catatPembayaranSpp({
        santriId: santri.id,
        bulan: bulanDate,
        nominal: santri.sppBulanan,
        metode,
      });

      if (res.success) {
        toast.success(res.message);
        setSelected(new Set());
        onClose();
        window.location.reload();
      } else {
        toast.error(res.message ?? "Gagal memproses pembayaran");
      }
    });
  };

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
            Konfirmasi Pembayaran SPP
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-surface-container-low p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">
              Santri
            </p>
            <p className="mt-0.5 font-bold text-on-surface">{santri.nama}</p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-bright px-4 py-3">
              <span className="text-sm text-on-surface-variant">SPP Bulanan</span>
              <span className="font-bold text-primary tabular-nums">
                {formatRupiah(santri.sppBulanan)}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Bayar Bulan (bisa pilih beberapa)
            </label>
            <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-outline-variant bg-surface-bright p-3">
              {bulanBelum.length === 0 && (
                <p className="col-span-3 py-4 text-center text-sm text-on-surface-variant">
                  Semua bulan sudah lunas 🎉
                </p>
              )}
              {bulanBelum.map((b) => {
                const [y, m] = b.split("-");
                const idx = Number(m) - 1;
                const checked = selected.has(b);
                return (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => toggle(b)}
                    disabled={isPending}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                      checked
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-white text-on-surface hover:bg-primary/5"
                    }`}
                  >
                    {BULAN_2024[idx]} {y}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="metode-bayar" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Metode Pembayaran
            </label>
            <select
              id="metode-bayar"
              value={metode}
              onChange={(e) => setMetode(e.target.value as "TUNAI" | "TRANSFER")}
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="TUNAI">Tunai</option>
              <option value="TRANSFER">Transfer Bank</option>
            </select>
          </div>

          {selected.size > 0 && (
            <div className="rounded-2xl bg-primary/5 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-on-surface-variant">
                Total Bayar ({selected.size} bulan)
              </p>
              <p className="text-3xl font-bold text-primary tabular-nums">
                {formatRupiah(total)}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-outline-variant bg-white py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={selected.size === 0 || isPending}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Wallet className="h-4 w-4" aria-hidden />
              {isPending ? "Memproses..." : `Bayar ${formatRupiah(total)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
