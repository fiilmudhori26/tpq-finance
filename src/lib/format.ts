export type Jenis = "pemasukan" | "pengeluaran";
export type StatusTransaksi = "Lunas" | "Proses" | "Dibatalkan";
export type StatusSpp = "Lunas" | "Tunggakan";

export interface Transaksi {
  id: string;
  jenis: Jenis;
  deskripsi: string;
  kategori: string;
  sumber: string;
  jumlah: number;
  tanggal: string; // ISO
  status: StatusTransaksi;
  catatan?: string;
  ikon?: string;
}

export interface Tunggakan {
  id: string;
  nama: string;
  kelas: string;
  nominal: number;
  durasiBulan: number;
  inisial: string;
  avatarBg: string;
}

export interface TrendBulan {
  bulan: string; // "Mar"
  pemasukan: number;
  pengeluaran: number;
  aktif?: boolean;
}

export interface Kpi {
  label: string;
  nilai: string;
  sub?: string;
  chip?: string;
  chipTone?: "positive" | "negative" | "neutral";
  icon: string;
  iconBg: string;
  iconColor: string;
  hoverBorder?: string;
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function inisial(nama: string): string {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((k) => k[0] ?? "")
    .join("")
    .toUpperCase();
}
