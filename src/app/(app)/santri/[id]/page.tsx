import ProfilSantri from "@/components/features/profil-santri";
import { getProfilSantri } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function ProfilSantriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProfilSantri(id);
  if (!data) notFound();
  return <ProfilSantri data={data} />;
}
