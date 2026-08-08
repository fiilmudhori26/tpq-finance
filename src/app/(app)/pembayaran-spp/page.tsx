import { Suspense } from "react";
import { getSantriList } from "@/lib/data";
import SppListView from "@/components/features/spp-list-view";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = 10;

  const { data, total } = await getSantriList({ q, page, perPage, status: "AKTIF" });

  return (
    <Suspense>
      <SppListView initialData={data} total={total} page={page} perPage={perPage} />
    </Suspense>
  );
}
