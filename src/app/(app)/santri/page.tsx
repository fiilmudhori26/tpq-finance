import { Suspense } from "react";
import { getSantriList, getDaftarKelas } from "@/lib/data";
import SantriView from "@/components/features/santri-view";
import PageSkeleton from "@/components/ui/page-skeleton";

async function SantriTable({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = 8;

  const [list, daftarKelas] = await Promise.all([
    getSantriList({
      jenjang: sp.jenjang ?? "",
      kelas: sp.kelas ?? "",
      status: sp.status ?? "",
      q: sp.q ?? "",
      page,
      perPage,
    }),
    getDaftarKelas(),
  ]);

  return (
    <SantriView
      initialData={list.data}
      total={list.total}
      page={page}
      perPage={perPage}
      daftarKelas={daftarKelas}
    />
  );
}

export default async function SantriPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <SantriTable sp={sp} />
    </Suspense>
  );
}
