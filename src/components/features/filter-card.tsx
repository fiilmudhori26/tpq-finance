import { Filter } from "lucide-react";

export default function FilterCard({
  jenjang,
  kelas,
  status,
  onApply,
}: {
  jenjang: string;
  kelas: string;
  status: string;
  onApply: (f: { jenjang: string; kelas: string; status: string }) => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-soft">
      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onApply({ jenjang, kelas, status });
        }}
      >
        <label className="flex min-w-40 flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold text-on-surface-variant">
            Jenjang Pendidikan
          </span>
          <select
            value={jenjang}
            onChange={(e) => onApply({ jenjang: e.target.value, kelas, status })}
            className="rounded-lg border border-outline-variant bg-surface-bright px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Jenjang</option>
            <option>TKA - Paud</option>
            <option>TPA - SD</option>
            <option>TQA - SMP/SMA</option>
          </select>
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold text-on-surface-variant">Kelas</span>
          <select
            value={kelas}
            onChange={(e) => onApply({ jenjang, kelas: e.target.value, status })}
            className="rounded-lg border border-outline-variant bg-surface-bright px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Kelas</option>
            <option>Alif</option>
            <option>Ba</option>
            <option>Ta</option>
          </select>
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold text-on-surface-variant">
            Status Pembayaran
          </span>
          <select
            value={status}
            onChange={(e) => onApply({ jenjang, kelas, status: e.target.value })}
            className="rounded-lg border border-outline-variant bg-surface-bright px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Status</option>
            <option>Lunas</option>
            <option>Tunggakan</option>
          </select>
        </label>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Filter
        </button>
      </form>
    </div>
  );
}
