"use client";

import { useTransition } from "react";
import { ChevronLeft, CreditCard, Users, Link2, Check, UserRound } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { KELAS_LABEL } from "@/lib/mock-santri";
import type { ProfilSantri } from "@/lib/data";
import { generateWaliToken, simpanAkunWali } from "@/actions/wali";
import AvatarInitials from "@/components/ui/avatar";
import StatusBadge from "@/components/ui/status-badge";
import { useState } from "react";

export default function ProfilSantri({ data }: { data: ProfilSantri }) {
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState<string | null>(data.waliToken ?? null);
  const [copied, setCopied] = useState(false);
  const [akun, setAkun] = useState<{ email: string } | null>(data.akunWali ?? null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForm, setShowForm] = useState(false);

  const portalUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/wali/${token}`
    : null;

  const handleBuatLink = () => {
    startTransition(async () => {
      const res = await generateWaliToken(data.id);
      if (res.success && typeof res.data === "string") {
        setToken(res.data);
        toast.success(res.message);
      } else {
        toast.error(res.message ?? "Gagal membuat link");
      }
    });
  };

  const handleSalin = async () => {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      toast.success("Link portal disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleBuatAkun = () => {
    startTransition(async () => {
      const res = await simpanAkunWali({ santriId: data.id, email, password });
      if (res.success && typeof res.data === "object" && res.data && "email" in res.data) {
        setAkun({ email: res.data.email as string });
        setShowForm(false);
        setEmail("");
        setPassword("");
        toast.success(res.message);
      } else {
        toast.error(res.message ?? "Gagal membuat akun");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Kembali ke Santri
        </button>
        <h1 className="text-2xl font-semibold text-on-surface">Profil Santri</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft sm:p-8">
          <div className="flex flex-col items-center gap-4">
            <AvatarInitials nama={data.nama} size="lg" variant={Number(data.noInduk.slice(-1))} />
            <div className="text-center">
              <p className="text-xl font-bold text-on-surface">{data.nama}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-on-surface-variant">
                ID: {data.noInduk}
              </p>
            </div>
            <StatusBadge status={data.statusSpp} dot />
          </div>
          <dl className="mt-6 space-y-3 border-t border-outline-variant/20 pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Jenjang</dt>
              <dd className="font-semibold text-on-surface">{data.jenjang}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Kelas</dt>
              <dd className="font-semibold text-on-surface">{KELAS_LABEL(data.jenjang, data.kelas)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Wali</dt>
              <dd className="font-semibold text-on-surface">{data.wali}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">No. HP</dt>
              <dd className="font-semibold text-on-surface tabular-nums">{data.noHp}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">SPP Bulanan</dt>
              <dd className="font-semibold text-primary tabular-nums">
                {formatRupiah((data as ProfilSantri & { sppBulanan: number }).sppBulanan)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft sm:p-8">
            <h2 className="text-lg font-semibold text-on-surface">Ringkasan Pembayaran</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-surface-container-low p-4 text-center sm:p-6">
                <p className="text-2xl font-bold text-primary sm:text-3xl">{data.lunasBulan}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                  Bulan Lunas
                </p>
              </div>
              <div className="rounded-2xl bg-error-container/30 p-4 text-center sm:p-6">
                <p className="text-2xl font-bold text-error sm:text-3xl">{data.tunggakanBulan}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                  Bulan Tunggakan
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => (window.location.href = `/pembayaran-spp/${data.noInduk}`)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
              >
                <CreditCard className="h-4 w-4" aria-hidden />
                Kelola Pembayaran SPP
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/santri")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-5 py-4 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
              >
                <Users className="h-4 w-4" aria-hidden />
                Daftar Santri
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft sm:p-8">
            <h2 className="text-lg font-semibold text-on-surface">Portal Wali</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Link unik untuk wali melihat riwayat & tunggakan SPP anak. Jangan disebarkan publik.
            </p>
            {token ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-bright px-4 py-3">
                  <Link2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="truncate text-sm text-on-surface">{portalUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSalin}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
                  {copied ? "Tersalin!" : "Salin Link Portal"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBuatLink}
                disabled={isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Link2 className="h-4 w-4" aria-hidden />
                {isPending ? "Membuat..." : "Buat Link Portal Wali"}
              </button>
            )}

            <div className="mt-6 border-t border-outline-variant/20 pt-6">
              <h3 className="text-sm font-bold text-on-surface">Akun Login Wali</h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Email & password agar wali bisa login langsung (tanpa link).
              </p>
              {akun ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-bright px-4 py-3">
                  <UserRound className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="truncate text-sm text-on-surface">{akun.email}</p>
                </div>
              ) : showForm ? (
                <form
                  className="mt-3 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleBuatAkun();
                  }}
                >
                  <div>
                    <label htmlFor="email-wali" className="mb-1 block text-xs font-medium text-on-surface-variant">
                      Email wali
                    </label>
                    <input
                      id="email-wali"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="wali@email.com"
                      disabled={isPending}
                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="password-wali" className="mb-1 block text-xs font-medium text-on-surface-variant">
                      Password (min. 8 karakter)
                    </label>
                    <input
                      id="password-wali"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isPending}
                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      disabled={isPending}
                      className="flex-1 rounded-lg border border-outline-variant bg-white py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-[2] rounded-lg bg-primary py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isPending ? "Menyimpan..." : "Buat Akun"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  disabled={isPending}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                >
                  <UserRound className="h-4 w-4" aria-hidden />
                  Buat Akun Login Wali
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
