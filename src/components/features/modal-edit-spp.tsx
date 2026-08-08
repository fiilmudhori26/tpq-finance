"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { editPembayaranSpp } from "@/actions/pembayaran";
import type { SantriDetail } from "@/lib/data";
import SubmitButton from "@/components/ui/submit-button";

export default function ModalEditSpp({
  open,
  onClose,
  santriId,
  item,
}: {
  open: boolean;
  onClose: () => void;
  santriId: string;
  item: SantriDetail["riwayat"][number] | null;
}) {
  const [nominal, setNominal] = useState("");
  const [metode, setMetode] = useState<"TUNAI" | "TRANSFER">("TUNAI");
  const [status, setStatus] = useState<"LUNAS" | "DIBATALKAN">("LUNAS");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && item) {
      setNominal(String(item.nominal));
      setMetode(item.metode);
      setStatus(item.status);
    }
  }, [open, item]);

  if (!open || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(nominal);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }

    startTransition(async () => {
      const res = await editPembayaranSpp({ id: item.id, nominal: n, metode, status });
      if (res.success) {
        toast.success(res.message);
        onClose();
        window.location.reload();
      } else {
        toast.error(res.message ?? "Gagal memperbarui pembayaran");
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-edit-spp"
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-8 shadow-lift md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="judul-modal-edit-spp" className="text-lg font-semibold text-on-surface">
            Edit Pembayaran
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
              No. Referensi
            </p>
            <p className="mt-0.5 font-bold text-on-surface tabular-nums">{item.noReferensi}</p>
          </div>

          <div>
            <label htmlFor="edit-nominal" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Nominal
            </label>
            <input
              id="edit-nominal"
              type="number"
              inputMode="numeric"
              min={1}
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="edit-metode" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Metode Pembayaran
            </label>
            <select
              id="edit-metode"
              value={metode}
              onChange={(e) => setMetode(e.target.value as "TUNAI" | "TRANSFER")}
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="TUNAI">Tunai</option>
              <option value="TRANSFER">Transfer Bank</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-status" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "LUNAS" | "DIBATALKAN")}
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="LUNAS">Lunas</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>

          <div className="rounded-2xl bg-primary/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">
              Nominal
            </p>
            <p className="text-3xl font-bold text-primary tabular-nums">
              {formatRupiah(Number(nominal) || 0)}
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-outline-variant bg-white py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
            >
              Batal
            </button>
            <SubmitButton
              pending={isPending}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
