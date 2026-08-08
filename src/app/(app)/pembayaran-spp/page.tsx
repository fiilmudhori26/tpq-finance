import { Suspense } from "react";
import { getSantriList } from "@/lib/data";
import SppListView from "@/components/features/spp-list-view";
import PageSkeleton from "@/components/ui/page-skeleton";

async function SppTable({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = 10;
  const q = sp.q ?? "";

  const { data, total } = await getSantriList({ q, page, perPage, status: "AKTIF" });

  return <SppListView initialData={data} total={total} page={page} perPage={perPage} />;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <SppTable sp={sp} />
    </Suspense>
  );
}
