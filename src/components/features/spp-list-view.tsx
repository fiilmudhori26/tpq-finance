"use client";

import { useState } from "react";
import { CalendarCheck, Users, Wallet } from "lucide-react";
import { type SantriRow } from "@/lib/data";
import { formatRupiah } from "@/lib/format";
import SummaryCard from "@/components/ui/summary-card";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import ClassBadge from "@/components/ui/class-badge";
import AvatarInitials from "@/components/ui/avatar";
import PaginationBar from "@/components/features/pagination-bar";
import TableRowActions from "@/components/features/table-row-actions";

interface Props {
  initialData: SantriRow[];
  total: number;
  page: number;
  perPage: number;
}

export default function SppListView({ initialData, total, page, perPage }: Props) {
  const [q, setQ] = useState("");

  const filtered = q
    ? initialData.filter(
        (s) =>
          s.nama.toLowerCase().includes(q.toLowerCase()) || s.noInduk.includes(q)
      )
    : initialData;

  const totalLunas = filtered.filter((s) => s.statusSpp === "Lunas").length;
  const totalTunggakan = filtered.filter((s) => s.statusSpp === "Tunggakan").length;
  const totalNominal = filtered.reduce((a, s) => a + (s.sppBulanan ?? 0), 0);

  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Pembayaran SPP</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Pantau iuran bulanan seluruh santri TPQ.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          icon={CalendarCheck}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Santri Lunas"
          value={String(totalLunas)}
          sub={`dari ${total} santri aktif`}
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
          sub="tarif SPP aktif"
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
              {filtered.map((s, i) => (
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
                    {formatRupiah(s.sppBulanan)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.statusSpp} dot />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <TableRowActions href={`/pembayaran-spp/${s.id}`} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data santri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar
          total={total}
          page={current}
          perPage={perPage}
          basePath="/pembayaran-spp"
        />
      </Card>
    </div>
  );
}
