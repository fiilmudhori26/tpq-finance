"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type SantriRow } from "@/lib/data";
import { hapusSantri } from "@/actions/santri";
import { KELAS_LABEL } from "@/lib/mock-santri";
import FilterCard from "@/components/features/filter-card";
import PaginationBar from "@/components/features/pagination-bar";
import TableRowActions from "@/components/features/table-row-actions";
import AvatarInitials from "@/components/ui/avatar";
import ClassBadge from "@/components/ui/class-badge";
import StatusBadge from "@/components/ui/status-badge";
import ModalSantri from "@/components/features/modal-santri";

interface Props {
  initialData: SantriRow[];
  total: number;
  page: number;
  perPage: number;
}

export default function SantriView({ initialData, total, page, perPage }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const jenjang = params.get("jenjang") ?? "";
  const kelas = params.get("kelas") ?? "";
  const status = params.get("status") ?? "";

  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<SantriRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback(
    (patch: Record<string, string>) => {
      const u = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) u.set(k, v);
        else u.delete(k);
      }
      u.delete("page");
      router.push(`/santri?${u.toString()}`);
    },
    [params, router]
  );

  const handleHapus = (id: string) => {
    startTransition(async () => {
      const res = await hapusSantri(id);
      if (res.success) {
        toast.success(res.message ?? "Data santri diproses.");
        router.refresh();
      } else {
        toast.error(res.message ?? "Gagal memproses santri.");
      }
    });
  };

  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Data Master Santri</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Kelola data seluruh santri TPQ secara terpusat.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEdit(null);
            setModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Tambah Santri
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <FilterCard
            jenjang={jenjang}
            kelas={kelas}
            status={status}
            onApply={(f) => setParam(f)}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-primary-container p-6 text-on-primary-container">
            <div
              className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10"
              aria-hidden
            />
            <p className="text-xs font-bold uppercase tracking-wider">Total Santri</p>
            <p className="text-5xl font-bold">{total}</p>
            <p className="text-sm font-medium">Tercatat dalam sistem</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-medium">Nama Santri</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Wali Santri</th>
                <th className="px-6 py-4 font-medium">Status SPP</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {initialData.map((s, i) => (
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
                    <ClassBadge kelas={KELAS_LABEL(s.jenjang, s.kelas)} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-on-surface">{s.wali}</p>
                    <p className="text-xs text-on-surface-variant">{s.noHp}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.statusSpp} dot />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <TableRowActions
                        href={`/santri/${s.id}`}
                        onEdit={() => {
                          setEdit(s);
                          setModal(true);
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Hapus santri"
                        disabled={isPending}
                        onClick={() => handleHapus(s.id)}
                        className="rounded-full p-2 text-error hover:bg-error/10 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Belum ada data santri.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar total={total} page={current} perPage={perPage} basePath="/santri" />
      </div>

      <ModalSantri
        open={modal}
        onClose={() => {
          setModal(false);
          router.refresh();
        }}
        edit={edit}
      />
    </div>
  );
}
