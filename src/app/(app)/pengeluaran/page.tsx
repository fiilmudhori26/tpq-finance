import { Suspense } from "react";
import { getTransaksiList, getKategoriList } from "@/lib/data";
import PengeluaranView from "@/components/features/pengeluaran-view";
import PageSkeleton from "@/components/ui/page-skeleton";

async function PengeluaranTable({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = 10;
  const kategoriId = sp.kategoriId ?? undefined;

  const [{ data, total }, kategoris] = await Promise.all([
    getTransaksiList({ jenis: "pengeluaran", page, perPage, kategoriId }),
    getKategoriList("PENGELUARAN"),
  ]);

  return (
    <PengeluaranView
      initialData={data}
      total={total}
      page={page}
      perPage={perPage}
      kategoris={kategoris.map((k) => ({ id: k.id, nama: k.nama }))}
    />
  );
}

export default async function PengeluaranPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <PengeluaranTable sp={sp} />
    </Suspense>
  );
}
