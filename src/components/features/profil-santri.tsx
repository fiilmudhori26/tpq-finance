"use client";

import { ChevronLeft, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SANTRI, KELAS_LABEL } from "@/lib/mock-santri";
import { SANTRI_SPP } from "@/lib/mock-pembayaran";
import AvatarInitials from "@/components/ui/avatar";
import StatusBadge from "@/components/ui/status-badge";

export default function ProfilSantri() {
  const { id } = useParams<{ id: string }>();
  const s = SANTRI.find((x) => x.id === id);

  if (!s) {
    return (
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center shadow-soft">
        <p className="text-lg font-semibold text-on-surface">Santri tidak ditemukan.</p>
        <p className="mt-1 text-sm text-on-surface-variant">Periksa kembali ID santri.</p>
      </div>
    );
  }

  const spp = SANTRI_SPP[s.id];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/santri"
          className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Kembali ke Santri
        </Link>
        <h1 className="text-2xl font-semibold text-on-surface">Profil Santri</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-soft">
          <div className="flex flex-col items-center gap-4">
            <AvatarInitials nama={s.nama} size="lg" variant={Number(s.id.slice(1))} />
            <div className="text-center">
              <p className="text-xl font-bold text-on-surface">{s.nama}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-on-surface-variant">
                ID: {s.noInduk}
              </p>
            </div>
            <StatusBadge status={s.statusSpp} dot />
          </div>
          <dl className="mt-6 space-y-3 border-t border-outline-variant/20 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Jenjang</dt>
              <dd className="font-semibold text-on-surface">{s.jenjang}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Kelas</dt>
              <dd className="font-semibold text-on-surface">{KELAS_LABEL(s.jenjang, s.kelas)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Wali</dt>
              <dd className="font-semibold text-on-surface">{s.wali}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">No. HP</dt>
              <dd className="font-semibold text-on-surface tabular-nums">{s.noHp}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-soft lg:col-span-2">
          <h2 className="text-lg font-semibold text-on-surface">Ringkasan Pembayaran</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-container-low p-6 text-center">
              <p className="text-3xl font-bold text-primary">{spp?.lunasBulan ?? 0}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                Bulan Lunas
              </p>
            </div>
            <div className="rounded-2xl bg-error-container/30 p-6 text-center">
              <p className="text-3xl font-bold text-error">{spp?.tunggakanBulan ?? 0}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                Bulan Tunggakan
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/pembayaran-spp/${s.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <CreditCard className="h-4 w-4" aria-hidden />
              Kelola Pembayaran SPP
            </Link>
            <Link
              href="/santri"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-5 py-4 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
            >
              <Users className="h-4 w-4" aria-hidden />
              Daftar Santri
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
