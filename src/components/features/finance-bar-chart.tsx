"use client";

import { useState } from "react";
import type { TrendBulan } from "@/lib/format";

export default function FinanceBarChart({
  data,
  periode,
}: {
  data: TrendBulan[];
  periode: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => Math.max(d.pemasukan, d.pengeluaran)));

  return (
    <div className="mt-8">
      {/* grid */}
      <div className="relative h-56">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <div
            key={f}
            className="absolute inset-x-0 border-b border-outline-variant/30"
            style={{ top: `${f * 100}%` }}
          />
        ))}

        <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 sm:gap-6">
          {data.map((d, i) => {
            const p = (d.pemasukan / max) * 100;
            const k = (d.pengeluaran / max) * 100;
            const isHover = hover === i;
            return (
              <div
                key={d.bulan}
                className="group relative flex h-full flex-1 items-end justify-center gap-2 sm:gap-3"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {/* tooltip */}
                {isHover && (
                  <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1 text-[10px] text-inverse-on-surface shadow-lift">
                    Pemasukan Rp{(d.pemasukan * 1_000_000).toLocaleString("id-ID")} ·
                    Pengeluaran Rp
                    {(d.pengeluaran * 1_000_000).toLocaleString("id-ID")}
                  </div>
                )}
                <div className="flex h-full items-end gap-1">
                  <div
                    className={`w-2.5 rounded-t-full transition-all sm:w-4 ${
                      d.aktif ? "bg-primary-container" : "bg-primary"
                    } ${isHover ? "scale-x-110" : ""}`}
                    style={{ height: `${Math.max(p, 4)}%` }}
                    role="img"
                    aria-label={`${d.bulan}: pemasukan ${d.pemasukan} juta, pengeluaran ${d.pengeluaran} juta`}
                  />
                  <div
                    className="w-2.5 rounded-t-full bg-secondary transition-all sm:w-4"
                    style={{ height: `${Math.max(k, 4)}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* labels */}
      <div className="mt-3 flex justify-between gap-2 px-2 sm:gap-6">
        {data.map((d) => (
          <span
            key={d.bulan}
            className={`flex-1 text-center text-sm ${
              d.aktif ? "font-bold text-on-surface" : "text-on-surface-variant"
            }`}
          >
            {d.bulan}
          </span>
        ))}
      </div>

      {/* legenda + periode */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Pemasukan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Pengeluaran
          </span>
        </div>
        <p className="text-xs font-medium text-on-surface-variant">{periode}</p>
      </div>
    </div>
  );
}
