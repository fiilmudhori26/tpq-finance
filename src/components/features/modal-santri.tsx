"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { JENJANG, KELAS, type Santri } from "@/lib/mock-santri";

export default function ModalSantri({
  open,
  onClose,
  edit,
}: {
  open: boolean;
  onClose: () => void;
  edit: Santri | null;
}) {
  const [nama, setNama] = useState("");
  const [jenjang, setJenjang] = useState<string>(JENJANG[0]);
  const [kelas, setKelas] = useState<string>(KELAS[0]);
  const [wali, setWali] = useState("");
  const [noHp, setNoHp] = useState("");

  useEffect(() => {
    if (open) {
      setNama(edit?.nama ?? "");
      setJenjang(edit?.jenjang ?? JENJANG[0]);
      setKelas(edit?.kelas ?? KELAS[0]);
      setWali(edit?.wali ?? "");
      setNoHp(edit?.noHp ?? "");
    }
  }, [open, edit]);

  if (!open) return null;

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
            <label htmlFor="nama" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Nama Lengkap
            </label>
            <input
              id="nama"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama santri"
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
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
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
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
              <select
                id="kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              >
                {KELAS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
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
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
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
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
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
              {edit ? "Simpan Perubahan" : "Simpan Santri"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
