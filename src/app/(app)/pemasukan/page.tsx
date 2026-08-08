import { Suspense } from "react";
import { getTransaksiList, getKategoriList } from "@/lib/data";
import PemasukanView from "@/components/features/pemasukan-view";

export default async function PemasukanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = 10;
  const kategoriId = sp.kategoriId ?? undefined;

  const [{ data, total }, kategoris] = await Promise.all([
    getTransaksiList({ jenis: "pemasukan", page, perPage, kategoriId }),
    getKategoriList("PEMASUKAN"),
  ]);

  return (
    <Suspense>
      <PemasukanView
        initialData={data}
        total={total}
        page={page}
        perPage={perPage}
        kategoris={kategoris.map((k) => ({ id: k.id, nama: k.nama }))}
      />
    </Suspense>
  );
}
