"use client";

import { CheckCircle2, AlertCircle, GraduationCap } from "lucide-react";
import { formatRupiah } from "@/lib/format";

const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

interface RiwayatItem {
  noReferensi: string;
  bulan: string;
  tanggal: string;
  nominal: number;
  metode: string;
}

export default function WaliPortal({
  nama,
  noInduk,
  kelas,
  namaWali,
  sppBulanan,
  tunggakan,
  riwayat,
}: {
  nama: string;
  noInduk: string;
  kelas: string;
  namaWali: string | null;
  sppBulanan: number;
  tunggakan: string[];
  riwayat: RiwayatItem[];
}) {
  const lunasSet = new Set(riwayat.map((r) => r.bulan));
  const totalTunggakan = tunggakan.length * sppBulanan;
  const now = new Date();
  const bulanTahunIni = now.getMonth() + 1;

  return (
    <main className="min-h-screen bg-surface-container-low px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
            <GraduationCap className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-on-surface">Portal Wali Santri</h1>
          <p className="mt-1 text-sm text-on-surface-variant">TPQ Al-Ikhlas — informasi SPP anak</p>
        </header>

        <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container text-xl font-bold text-secondary">
              {nama.split(" ").map((k) => k[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-lg font-bold text-on-surface">{nama}</p>
              <p className="text-sm text-on-surface-variant">Kelas {kelas} · No. Induk {noInduk}</p>
              {namaWali && <p className="text-xs text-on-surface-variant">Wali: {namaWali}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-inverse-surface p-6 text-inverse-on-surface shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-inverse-on-surface/70">
            Total Tunggakan
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {formatRupiah(totalTunggakan)}
          </p>
          <p className="mt-1 text-sm text-inverse-on-surface/80">
            {tunggakan.length} bulan belum dibayar · SPP {formatRupiah(sppBulanan)}/bulan
          </p>
        </section>

        <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-on-surface">
            Status Pembayaran {now.getFullYear()}
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
            {Array.from({ length: bulanTahunIni }, (_, i) => {
              const key = `${now.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
              const lunas = lunasSet.has(key);
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-bold ${
                    lunas
                      ? "border-transparent bg-primary text-white"
                      : "border-error/20 bg-error-container text-error"
                  }`}
                >
                  {lunas ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <AlertCircle className="h-5 w-5" aria-hidden />}
                  {BULAN[i]}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-on-surface">Riwayat Pembayaran</h2>
          {riwayat.length === 0 ? (
            <p className="mt-4 text-sm text-on-surface-variant">Belum ada riwayat pembayaran.</p>
          ) : (
            <div className="mt-4 divide-y divide-outline-variant/20">
              {riwayat.map((r) => {
                const [y, m] = r.bulan.split("-");
                return (
                  <div key={r.noReferensi} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        SPP {BULAN[Number(m) - 1]} {y}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {r.noReferensi} · {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(r.tanggal))} · {r.metode === "TUNAI" ? "Tunai" : "Transfer"}
                      </p>
                    </div>
                    <span className="font-bold tabular-nums text-primary">{formatRupiah(r.nominal)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="pb-6 text-center text-xs text-on-surface-variant">
          Link ini bersifat pribadi — jangan disebarkan. Hubungi bendahara TPQ jika ada pertanyaan.
        </p>
      </div>
    </main>
  );
}
