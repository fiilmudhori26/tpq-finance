import { Suspense } from "react";
import { getSantriList } from "@/lib/data";
import SantriView from "@/components/features/santri-view";

export default async function SantriPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const jenjang = sp.jenjang ?? "";
  const kelas = sp.kelas ?? "";
  const status = sp.status ?? "";
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = 8;

  const { data, total } = await getSantriList({ jenjang, kelas, status, q, page, perPage });

  return (
    <Suspense>
      <SantriView
        initialData={data}
        total={total}
        page={page}
        perPage={perPage}
      />
    </Suspense>
  );
}
