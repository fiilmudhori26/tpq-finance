import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { Tunggakan } from "@/lib/format";
import { formatRupiah } from "@/lib/format";

export default function ArrearsList({
  items,
}: {
  items: Tunggakan[];
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-on-surface">Tunggakan SPP</h2>
        <AlertTriangle className="h-5 w-5 text-error" aria-hidden />
      </div>

      <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {items.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-container-low"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.avatarBg}`}
              aria-hidden
            >
              {t.inisial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-on-surface">{t.nama}</p>
              <p className="text-xs text-on-surface-variant">{t.kelas}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-error tabular-nums">
                {formatRupiah(t.nominal)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                {t.durasiBulan} Bulan
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/santri?status=tunggakan"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-3 text-sm font-bold text-on-secondary-container transition-colors hover:bg-secondary-container/80"
      >
        Lihat Semua
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
