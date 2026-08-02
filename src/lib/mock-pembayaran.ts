export interface PembayaranSpp {
  noReferensi: string;
  tanggal: string; // ISO
  bulan: string; // "2024-01" dst
  nominal: number;
}

export interface SantriPembayaran {
  id: string;
  nama: string;
  kelas: string;
  noInduk: string;
  status: "Aktif" | "Nonaktif";
  sppBulanan: number;
  lunasBulan: number; // jumlah bulan lunas di 2024
  tunggakanBulan: number;
  bayar: Record<string, PembayaranSpp>; // key bulan "2024-01"
}

const SPP_RATE = 75_000;

// Bulan lunas: JAN–JUL 2024, tunggakan AGU–SEP (Zaki Ramadhan pola acuan)
export const SANTRI_SPP: Record<string, SantriPembayaran> = {
  s1: {
    id: "s1",
    nama: "Aisyah Putri",
    kelas: "TPA - Ba",
    noInduk: "20240001",
    status: "Aktif",
    sppBulanan: SPP_RATE,
    lunasBulan: 7,
    tunggakanBulan: 2,
    bayar: Object.fromEntries(
      ["01", "02", "03", "04", "05", "06", "07"].map((m, i) => [
        `2024-${m}`,
        {
          noReferensi: `#TRX-${88210 - i}`,
          tanggal: `2024-${m}-10`,
          bulan: `2024-${m}`,
          nominal: SPP_RATE,
        },
      ])
    ),
  },
};

// Fallback: santri lain dari daftar SANTRI — lunas bertahap
import { SANTRI } from "./mock-santri";

for (const s of SANTRI.slice(1)) {
  const lunas = 3 + ((s.id.charCodeAt(1) + s.id.charCodeAt(2)) % 5); // 3-7 bulan
  SANTRI_SPP[s.id] = {
    id: s.id,
    nama: s.nama,
    kelas: `${s.jenjang} - ${s.kelas}`,
    noInduk: s.noInduk,
    status: "Aktif",
    sppBulanan: SPP_RATE,
    lunasBulan: lunas,
    tunggakanBulan: 0,
    bayar: Object.fromEntries(
      Array.from({ length: lunas }, (_, i) => {
        const m = String(i + 1).padStart(2, "0");
        return [
          `2024-${m}`,
          {
            noReferensi: `#TRX-${87000 - i}`,
            tanggal: `2024-${m}-12`,
            bulan: `2024-${m}`,
            nominal: SPP_RATE,
          },
        ];
      })
    ),
  };
}

export const BULAN_2024 = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
