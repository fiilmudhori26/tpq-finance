import { Suspense } from "react";
import LaporanView from "@/components/features/laporan-view";
import { getLaporanData } from "@/lib/data";
import PageSkeleton from "@/components/ui/page-skeleton";

async function LaporanContent() {
  const data = await getLaporanData();
  return <LaporanView {...data} />;
}

export default async function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LaporanContent />
    </Suspense>
  );
}
