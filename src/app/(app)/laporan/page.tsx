import LaporanView from "@/components/features/laporan-view";
import { getLaporanData } from "@/lib/data";

export default async function Page() {
  const data = await getLaporanData();
  return <LaporanView {...data} />;
}