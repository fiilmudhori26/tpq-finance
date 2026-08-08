"use client";

import { useRef, useState, useTransition } from "react";
import { X, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { tambahTransaksi } from "@/actions/transaksi";

export interface KategoriOption {
  id: string;
  nama: string;
}

const MAX_FOTO = 1.5 * 1024 * 1024; // 1.5 MB (base64 ~2MB)

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

export default function ModalPengeluaran({
  open,
  onClose,
  kategoris = [],
}: {
  open: boolean;
  onClose: () => void;
  kategoris?: KategoriOption[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [bukti, setBukti] = useState<string>("");
  const [kategoriId, setKategoriId] = useState(kategoris[0]?.id ?? "");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [keterangan, setKeterangan] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FOTO) {
      toast.error("Ukuran foto maksimal 1.5 MB");
      e.target.value = "";
      return;
    }
    setFileName(file.name);
    fileToBase64(file)
      .then((b64) => setBukti(b64))
      .catch(() => toast.error("Gagal membaca file"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = Number(jumlah);
    if (!nominal || nominal <= 0) {
      toast.error("Jumlah nominal pengeluaran harus lebih dari 0");
      return;
    }

    startTransition(async () => {
      const res = await tambahTransaksi({
        jenis: "PENGELUARAN",
        kategoriId: kategoriId || (kategoris[0]?.id ?? ""),
        keterangan,
        jumlah: nominal,
        tanggal: new Date(tanggal),
        buktiUrl: bukti || null,
      });

      if (res.success) {
        toast.success(res.message);
        setJumlah("");
        setKeterangan("");
        setFileName("");
        setBukti("");
        onClose();
      } else {
        toast.error(res.message ?? "Gagal menyimpan pengeluaran");
      }
    });
  };

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
            disabled={isPending}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-4 p-8 pt-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="tanggal" className="mb-1 block text-sm font-medium text-on-surface-variant">
              Tanggal Transaksi
            </label>
            <input
              id="tanggal"
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {kategoris.length > 0 && (
              <div>
                <label htmlFor="kategori" className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Kategori
                </label>
                <select
                  id="kategori"
                  value={kategoriId}
                  onChange={(e) => setKategoriId(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  {kategoris.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={kategoris.length === 0 ? "col-span-2" : ""}>
              <label htmlFor="jumlah" className="mb-1 block text-sm font-medium text-on-surface-variant">
                Jumlah
              </label>
              <input
                id="jumlah"
                type="number"
                min={1}
                required
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                disabled={isPending}
                placeholder="Rp"
                className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm font-bold text-primary tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
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
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              disabled={isPending}
              placeholder="Rincian pengeluaran"
              className="w-full resize-none rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-on-surface-variant">
              Unggah Bukti (Opsional)
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isPending}
              onChange={handleFile}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright px-4 py-8 text-sm text-on-surface-variant transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
            >
              <UploadCloud className="h-8 w-8 text-primary" aria-hidden />
              {fileName || "PNG, JPG up to 1.5MB"}
            </button>
            {bukti && (
              <img
                src={bukti}
                alt="Pratinjau bukti nota"
                className="mt-2 max-h-40 rounded-xl border border-outline-variant object-contain"
              />
            )}
          </div>

          <div className="flex gap-4 bg-surface-container-low p-4 pt-5">
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
              {isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
