import type { Pembayaran } from "@prisma/client";

export interface PortalRiwayat {
  noReferensi: string;
  bulan: string; // YYYY-MM
  tanggal: string;
  nominal: number;
  metode: string;
}

export interface PortalData {
  sppBulanan: number;
  tunggakan: string[];
  riwayat: PortalRiwayat[];
}

type PembayaranLunas = Pick<Pembayaran, "bulan" | "noReferensi" | "paidAt" | "nominal" | "metode">;

function keyBulan(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Data portal wali per santri: tarif, tunggakan (Juli–bulan lalu), riwayat lunas. */
export function buildPortalData(pembayarans: PembayaranLunas[], sppBulanan: number, now = new Date()): PortalData {
  const lunasSet = new Set(pembayarans.map((p) => keyBulan(p.bulan)));

  const tahunAjar = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const bulanAwal = new Date(tahunAjar, 6, 1);
  const bulanIni = new Date(now.getFullYear(), now.getMonth(), 1);

  const tunggakan: string[] = [];
  for (let d = new Date(bulanAwal); d < bulanIni; d.setMonth(d.getMonth() + 1)) {
    const key = keyBulan(d);
    if (!lunasSet.has(key)) tunggakan.push(key);
  }

  const riwayat: PortalRiwayat[] = pembayarans.map((p) => ({
    noReferensi: p.noReferensi,
    bulan: keyBulan(p.bulan),
    tanggal: p.paidAt.toISOString(),
    nominal: Number(p.nominal),
    metode: p.metode,
  }));

  return { sppBulanan, tunggakan, riwayat };
}
