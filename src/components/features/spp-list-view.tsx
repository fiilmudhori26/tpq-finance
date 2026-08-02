"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Users, Wallet } from "lucide-react";
import { SANTRI } from "@/lib/mock-santri";
import { SANTRI_SPP } from "@/lib/mock-pembayaran";
import { formatRupiah } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import ClassBadge from "@/components/ui/class-badge";
import AvatarInitials from "@/components/ui/avatar";
import PaginationBar from "@/components/features/pagination-bar";
import TableRowActions from "@/components/features/table-row-actions";

const PER_PAGE = 10;

export default function SppListView() {
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const r = SANTRI.filter((s) =>
      q ? s.nama.toLowerCase().includes(q.toLowerCase()) || s.noInduk.includes(q) : true
    );
    return r;
  }, [q]);

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const totalTunggakan = SANTRI.filter((s) => s.statusSpp === "Tunggakan").length;
  const totalLunas = SANTRI.length - totalTunggakan;
  const totalNominal = SANTRI.reduce(
    (a, s) => a + (SANTRI_SPP[s.id]?.sppBulanan ?? 75_000),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Pembayaran SPP</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Pantau iuran bulanan seluruh santri TPQ Al-Ikhlas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={CalendarCheck}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Santri Lunas"
          value={String(totalLunas)}
          sub={`dari ${SANTRI.length} santri aktif`}
          chip="+2.4%"
          chipTone="positive"
        />
        <SummaryCard
          icon={Users}
          iconBg="bg-error/10"
          iconColor="text-error"
          label="Santri Tunggakan"
          value={String(totalTunggakan)}
          sub="perlu ditagih bulan ini"
        />
        <SummaryCard
          icon={Wallet}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Total SPP Bulan Ini"
          value={formatRupiah(totalNominal)}
          sub="tarif SPP 2024/2025"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama santri atau nomor induk…"
          className="w-full max-w-xs rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary"
        />
        <p className="text-sm text-on-surface-variant tabular-nums">
          {totalLunas} lunas · {totalTunggakan} tunggakan
        </p>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-medium">Santri</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Tarif SPP</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {visible.map((s, i) => {
                const spp = SANTRI_SPP[s.id];
                const lunas = spp?.lunasBulan ?? 0;
                const tunggakan = spp?.tunggakanBulan ?? 0;
                return (
                  <tr key={s.id} className="group transition-colors hover:bg-primary/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarInitials nama={s.nama} variant={i} />
                        <div>
                          <p className="font-semibold text-on-surface">{s.nama}</p>
                          <p className="text-xs text-on-surface-variant">ID: {s.noInduk}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ClassBadge kelas={`${s.jenjang} - ${s.kelas}`} />
                    </td>
                    <td className="px-6 py-4 text-sm tabular-nums text-on-surface">
                      {formatRupiah(spp?.sppBulanan ?? 75_000)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={s.statusSpp} dot />
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {lunas} lunas · {tunggakan} tunggakan
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <TableRowActions href={`/pembayaran-spp/${s.id}`} />
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar total={total} page={current} perPage={PER_PAGE} basePath="/pembayaran-spp" />
      </Card>
    </div>
  );
}
