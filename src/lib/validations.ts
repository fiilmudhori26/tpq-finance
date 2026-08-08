import { z } from "zod";

export const akunWaliSchema = z.object({
  santriId: z.string().min(1, "Santri wajib dipilih"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const santriSchema = z.object({
  nama: z.string().min(2, "Nama santri minimal 2 karakter"),
  jenjang: z.enum(["TKA", "TPA", "TQA"], {
    message: "Pilih jenjang yang valid (TKA/TPA/TQA)",
  }),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  namaWali: z.string().optional().nullable(),
  noHpWali: z.string().optional().nullable(),
  keterangan: z.string().optional().nullable(),
});

export const transaksiSchema = z.object({
  jenis: z.enum(["PEMASUKAN", "PENGELUARAN"]),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
  sumber: z.string().optional().nullable(),
  keterangan: z.string().optional().nullable(),
  jumlah: z.number().gt(0, "Jumlah nominal harus lebih dari 0"),
  tanggal: z.coerce.date(),
  buktiUrl: z.string().optional().nullable(),
});

export const renameKelasSchema = z.object({
  jenjang: z.enum(["TKA", "TPA", "TQA"]),
  kelasLama: z.string().min(1, "Kelas lama wajib diisi"),
  kelasBaru: z.string().trim().min(1, "Nama kelas baru wajib diisi"),
});

export const pembayaranSppSchema = z.object({
  santriId: z.string().min(1, "Santri wajib dipilih"),
  bulan: z.array(z.coerce.date()).min(1, "Pilih minimal 1 bulan"),
  nominal: z.number().gt(0, "Nominal SPP harus lebih dari 0"),
  metode: z.enum(["TUNAI", "TRANSFER"]).default("TUNAI"),
  catatan: z.string().optional().nullable(),
});

export const editPembayaranSppSchema = z.object({
  id: z.string().min(1, "ID pembayaran wajib ada"),
  nominal: z.number().gt(0, "Nominal SPP harus lebih dari 0"),
  metode: z.enum(["TUNAI", "TRANSFER"]),
  status: z.enum(["LUNAS", "DIBATALKAN"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SantriInput = z.infer<typeof santriSchema>;
export type RenameKelasInput = z.infer<typeof renameKelasSchema>;
export type TransaksiInput = z.infer<typeof transaksiSchema>;
export type PembayaranSppInput = z.infer<typeof pembayaranSppSchema>;
export type EditPembayaranSppInput = z.infer<typeof editPembayaranSppSchema>;
export type AkunWaliInput = z.infer<typeof akunWaliSchema>;
