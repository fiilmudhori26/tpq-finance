import SppDetail from "@/components/features/spp-detail";
import { getSantriDetail } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSantriDetail(id);
  if (!data) notFound();
  return <SppDetail data={data} />;
}
