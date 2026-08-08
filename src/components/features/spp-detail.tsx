"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, AlertCircle, Clock, ChevronLeft, Printer } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { SantriDetail } from "@/lib/data";
import ModalBayar from "./modal-bayar";

const BULAN_2024 = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function bulanKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function SppDetail({ data }: { data: SantriDetail }) {
  const [open, setOpen] = useState(false);

  const totalTunggakan = data.tunggakanBulan * data.sppBulanan;

  // Bulan-bulan dalam tahun berjalan yang belum dibayar
  const now = new Date();
  const lunasSet = new Set(data.riwayat.map((r) => r.bulan));
  const bulanBelum: string[] = [];
  for (let m = 0; m < now.getMonth(); m++) {
    const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
    if (!lunasSet.has(key)) bulanBelum.push(key);
  }

  const riwayat = [...data.riwayat].sort((a, b) => b.bulan.localeCompare(a.bulan));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/pembayaran-spp"
            className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Kembali ke Pembayaran SPP
          </Link>
          <h1 className="text-2xl font-semibold text-on-surface">Pembayaran SPP</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manajemen iuran bulanan santri TPQ Al-Ikhlas
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
        >
          <Printer className="h-4 w-4" aria-hidden /> Cetak PDF
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Kiri */}
        <div className="col-span-12 space-y-6 lg:col-span-4">
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
            <div className="relative">
              <span className="absolute right-0 top-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Aktif
              </span>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white bg-secondary-container text-4xl font-bold text-secondary shadow-lg">
                    {data.nama.split(" ").map((k) => k[0]).join("").slice(0, 2)}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-on-surface">{data.nama}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">Kelas: {data.kelas}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-wider text-on-surface-variant">
                    ID: {data.noInduk}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-surface-container-low p-4 text-center">
                <p className="text-2xl font-bold text-primary">{data.lunasBulan} Bulan</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                  Total Lunas
                </p>
              </div>
              <div className="rounded-2xl bg-error-container/30 p-4 text-center">
                <p className="text-2xl font-bold text-error">{data.tunggakanBulan} Bulan</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                  Tunggakan
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-inverse-surface p-6 text-inverse-on-surface shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wider text-inverse-on-surface/70">
              Total Harus Dibayar
            </p>
            <p className="mt-2 text-[32px] font-bold tabular-nums">
              {formatRupiah(totalTunggakan)}
            </p>
            {bulanBelum.map((b) => {
              const idx = Number(b.split("-")[1]) - 1;
              return (
                <p key={b} className="mt-1 text-sm text-inverse-on-surface/80">
                  SPP {BULAN_2024[idx]} {b.split("-")[0]} {formatRupiah(data.sppBulanan)}
                </p>
              );
            })}
            <div className="my-4 h-px bg-white/10" aria-hidden />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full rounded-2xl bg-primary-container py-4 text-sm font-bold text-on-primary-container transition-opacity hover:opacity-90 active:scale-95"
            >
              Bayar Sekarang
            </button>
          </section>
        </div>

        {/* Kanan */}
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-on-surface">
                Checklist Pembayaran {now.getFullYear()}
              </h2>
              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Lunas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-error" /> Tunggakan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-container-highest" /> Belum
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: now.getMonth() + 1 }, (_, i) => {
                const key = `${now.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
                const st = lunasSet.has(key) ? "lunas" : "tunggakan";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => st !== "lunas" && setOpen(true)}
                    aria-label={`${BULAN_2024[i]} ${st === "lunas" ? "sudah dibayar" : "menunggak"}`}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-transform hover:scale-105 ${
                      st === "lunas"
                        ? "border-transparent bg-primary text-white ring-4 ring-primary/5"
                        : "animate-pulse border-error/20 bg-error-container text-error"
                    }`}
                  >
                    {st === "lunas" ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden />
                    ) : (
                      <AlertCircle className="h-5 w-5" aria-hidden />
                    )}
                    {BULAN_2024[i]}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-on-surface">Riwayat Pembayaran</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4 py-3 font-medium">No. Referensi</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Bulan SPP</th>
                    <th className="px-4 py-3 text-right font-medium">Nominal</th>
                    <th className="px-4 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {riwayat.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                        Belum ada riwayat pembayaran.
                      </td>
                    </tr>
                  )}
                  {riwayat.map((b) => {
                    const [y, m] = b.bulan.split("-");
                    return (
                      <tr key={b.noReferensi} className="transition-colors hover:bg-primary/5">
                        <td className="px-4 py-4 text-sm font-semibold text-on-surface tabular-nums">
                          {b.noReferensi}
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant tabular-nums">
                          {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(b.tanggal))}
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface">
                          {BULAN_2024[Number(m) - 1]} {y}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-primary tabular-nums">
                          {formatRupiah(b.nominal)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase text-primary">
                            Lunas
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/pembayaran-spp/${data.id}/kwitansi?ref=${b.noReferensi}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                          >
                            <Printer className="h-3.5 w-3.5" aria-hidden /> Kwitansi
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <ModalBayar
        open={open}
        onClose={() => setOpen(false)}
        santri={{ id: data.id, nama: data.nama, sppBulanan: data.sppBulanan }}
        bulanBelum={bulanBelum}
      />
    </div>
  );
}
