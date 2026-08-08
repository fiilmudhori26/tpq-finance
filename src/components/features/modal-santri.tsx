"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { JENJANG } from "@/lib/mock-santri";
import { tambahSantri, editSantri } from "@/actions/santri";
import type { SantriRow } from "@/lib/data";

export default function ModalSantri({
  open,
  onClose,
  edit,
}: {
  open: boolean;
  onClose: () => void;
  edit: SantriRow | null;
}) {
  const [nama, setNama] = useState("");
  const [jenjang, setJenjang] = useState<string>(JENJANG[0]);
  const [kelas, setKelas] = useState<string>("");
  const [wali, setWali] = useState("");
  const [noHp, setNoHp] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setNama(edit?.nama ?? "");
      setJenjang(edit?.jenjang ?? JENJANG[0]);
      setKelas(edit?.kelas ?? "");
      setWali(edit?.wali ?? "");
      setNoHp(edit?.noHp ?? "");
    }
  }, [open, edit]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const payload = {
        nama,
        jenjang: jenjang as "TKA" | "TPA" | "TQA",
        kelas,
        namaWali: wali,
        noHpWali: noHp,
      };

      const res = edit
        ? await editSantri(edit.id, payload)
        : await tambahSantri(payload);

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message ?? "Terjadi kesalahan");
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-modal-santri"
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-8 shadow-lift md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="judul-modal-santri" className="text-lg font-semibold text-on-surface">
            {edit ? "Edit Santri" : "Tambah Santri Baru"}
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
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Nama Lengkap
            </label>
            <input
              id="nama"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama santri"
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="jenjang" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Jenjang
              </label>
              <select
                id="jenjang"
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                {JENJANG.map((j) => (
                  <option key={j}>{j}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="kelas" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Kelas
              </label>
              <input
                id="kelas"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Ketik nama kelas (mis. Alif, Ba, ...)"
                disabled={isPending}
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="wali" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Nama Wali
            </label>
            <input
              id="wali"
              required
              value={wali}
              onChange={(e) => setWali(e.target.value)}
              placeholder="Nama wali / orang tua"
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="noHp" className="mb-1 block text-sm font-medium text-on-surface-variant">
              No. HP Wali
            </label>
            <input
              id="noHp"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="08xx-xxxx-xxxx"
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
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
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : edit ? "Simpan Perubahan" : "Simpan Santri"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
