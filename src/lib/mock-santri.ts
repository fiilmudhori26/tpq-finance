export interface Santri {
  id: string;
  noInduk: string;
  nama: string;
  jenjang: "TKA" | "TPA" | "TQA";
  kelas: string; // "Alif" | "Ba" | "Ta"
  wali: string;
  noHp: string;
  statusSpp: "Lunas" | "Tunggakan";
  tanggalMasuk: string; // ISO
}

export const JENJANG = ["TKA", "TPA", "TQA"] as const;
export const KELAS = ["Alif", "Ba", "Ta"] as const;
export const KELAS_LABEL = (jenjang: string, kelas: string) =>
  `${jenjang} - ${kelas}`;

const WALI = ["Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dedi Kurniawan", "Eka Lestari", "Fajar Nugroho"];
const NAMA = [
  "Aisyah Putri", "Muhammad Rizki", "Siti Nurhaliza", "Ahmad Al-Fatih",
  "Nabila Zahra", "Bilal Ramadhan", "Fatimah Azzahra", "Umar Faruq",
  "Khadijah Aulia", "Hamzah Asyari", "Maryam Safira", "Ali Imran",
  "Hafizh Abdullah", "Zainab Hasanah", "Yusuf Maulana", "Ruqayyah Amelia",
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const SANTRI: Santri[] = (() => {
  const r = rng(42);
  const bulan = ["Alif", "Ba", "Ta"] as const;
  return NAMA.map((nama, i) => {
    const jenjang = JENJANG[Math.floor(r() * 3)];
    return {
      id: `s${i + 1}`,
      noInduk: `2024${String(i + 1).padStart(4, "0")}`,
      nama,
      jenjang,
      kelas: bulan[Math.floor(r() * 3)],
      wali: WALI[Math.floor(r() * WALI.length)],
      noHp: `0812-3456-${String(1000 + Math.floor(r() * 9000))}`,
      statusSpp: r() < 0.3 ? "Tunggakan" : "Lunas",
      tanggalMasuk: `2024-0${1 + Math.floor(r() * 4)}-1${Math.floor(r() * 9)}`,
    };
  });
})();
