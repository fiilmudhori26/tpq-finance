import {
  School,
  Zap,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Transaksi } from "@/lib/format";
import { formatRupiah, formatTanggal } from "@/lib/format";

const IKON: Record<string, LucideIcon> = {
  school: School,
  zap: Zap,
  "heart-handshake": HeartHandshake,
  "book-open": BookOpen,
};

const STATUS: Record<string, string> = {
  Lunas: "bg-green-100 text-green-700",
  Proses: "bg-yellow-100 text-yellow-700",
  Dibatalkan: "bg-red-100 text-red-700",
};

export default function TransaksiTerbaru({
  items,
}: {
  items: Transaksi[];
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 p-6">
        <div>
          <h2 className="text-lg font-semibold text-on-surface">
            Transaksi Terbaru
          </h2>
          <p className="text-sm text-on-surface-variant">
            5 transaksi terakhir
          </p>
        </div>
        <a
          href="/transaksi"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
        >
          <span aria-hidden>+</span> Tambah Transaksi
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
              <th className="px-6 py-4 font-medium">Tanggal</th>
              <th className="px-6 py-4 font-medium">Deskripsi</th>
              <th className="px-6 py-4 font-medium">Kategori</th>
              <th className="px-6 py-4 text-right font-medium">Jumlah</th>
              <th className="px-6 py-4 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {items.map((t) => {
              const Icon = IKON[t.ikon ?? "book-open"] ?? BookOpen;
              const masuk = t.jenis === "pemasukan";
              return (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-primary/5"
                >
                  <td className="whitespace-nowrap px-6 py-5 text-sm text-on-surface-variant tabular-nums">
                    {formatTanggal(t.tanggal)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          masuk ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                        }`}
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-on-surface">
                        {t.deskripsi}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-sm text-on-surface-variant">
                    {t.kategori}
                  </td>
                  <td
                    className={`whitespace-nowrap px-6 py-5 text-right font-bold tabular-nums ${
                      masuk ? "text-primary" : "text-error"
                    }`}
                  >
                    {masuk ? "" : "-"}
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        STATUS[t.status] ?? "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-outline-variant/20 p-4 text-center">
        <a
          href="/transaksi"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          Lihat Semua Transaksi
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
