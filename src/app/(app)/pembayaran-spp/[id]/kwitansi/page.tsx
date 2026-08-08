import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { formatRupiah } from "@/lib/format";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const TERBILANG: [number, string][] = [
  [1_000_000_000, "miliar"], [1_000_000, "juta"], [1_000, "ribu"], [1, ""],
];
function terbilang(n: number): string {
  if (n === 0) return "nol rupiah";
  const parts: string[] = [];
  for (const [v, satuan] of TERBILANG) {
    const k = Math.floor(n / v);
    if (k > 0) {
      parts.push(k === 1 && v >= 1000 ? `satu ${satuan}` : `${k} ${satuan}`.trim());
      n -= k * v;
    }
  }
  return `${parts.join(" ")} rupiah`.replace(/\s+/g, " ");
}

export default async function KwitansiPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "BENDAHARA");
  const { id } = await params;
  const { ref } = await searchParams;

  const pembayaran = await db.pembayaran.findFirst({
    where: ref ? { noReferensi: ref, deletedAt: null } : { id, deletedAt: null },
    include: {
      santri: true,
      tenant: true,
      createdBy: { select: { name: true } },
    },
  });
  if (!pembayaran) notFound();

  const nominal = Number(pembayaran.nominal);
  const bulan = pembayaran.bulan.toLocaleString("id-ID", { month: "long", year: "numeric" });
  const tanggal = pembayaran.paidAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-black">
      <div className="flex items-start justify-between border-b-2 border-black pb-6">
        <div>
          <h1 className="text-2xl font-bold">TPQ AL-IKHLAS</h1>
          <p className="mt-1 text-sm text-gray-600">{pembayaran.tenant.nama} — Kwitansi Pembayaran SPP</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold uppercase tracking-wide">Kwitansi</p>
          <p className="mt-1 font-mono tabular-nums">{pembayaran.noReferensi}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4 text-sm">
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="font-medium text-gray-500">Sudah terima dari</span>
          <span className="font-bold">Bpk/Ibu {pembayaran.santri.namaWali ?? pembayaran.santri.nama}</span>
          <span className="font-medium text-gray-500">Wali dari</span>
          <span className="font-bold">{pembayaran.santri.nama} ({pembayaran.santri.noInduk})</span>
          <span className="font-medium text-gray-500">Uang sejumlah</span>
          <span className="font-bold tabular-nums">{formatRupiah(nominal)}</span>
          <span className="font-medium text-gray-500">Terbilang</span>
          <span className="italic">{terbilang(nominal)}</span>
          <span className="font-medium text-gray-500">Untuk pembayaran</span>
          <span className="font-bold">SPP Bulan {bulan}</span>
          <span className="font-medium text-gray-500">Metode</span>
          <span>{pembayaran.metode === "TUNAI" ? "Tunai" : "Transfer Bank"}</span>
        </div>
        <p className="text-xs text-gray-500">Dibayar pada {tanggal} · Dicatat oleh {pembayaran.createdBy.name}</p>
      </div>

      <div className="mt-12 flex items-end justify-between">
        <p className="text-xs text-gray-400">Kwitansi ini sah tanpa tanda tangan — tercatat digital dalam sistem.</p>
        <div className="text-center">
          <p className="text-sm">Bendahara,</p>
          <div className="h-16" />
          <p className="mt-2 font-bold underline">( {pembayaran.createdBy.name} )</p>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-300 pt-4 text-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-black px-6 py-3 text-sm font-bold text-white print:hidden"
        >
          Cetak / Simpan PDF
        </button>
      </div>
    </div>
  );
}
