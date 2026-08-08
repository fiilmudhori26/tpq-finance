// Test unit: logika bisnis murni (tanpa DB) — validasi zod, format, status tunggakan
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { santriSchema, transaksiSchema, pembayaranSppSchema } from "../src/lib/validations";
import { formatRupiah } from "../src/lib/format";

describe("validations", () => {
  it("santriSchema menolak nama < 2 char & jenjang invalid", () => {
    expect(santriSchema.safeParse({ nama: "A", jenjang: "TKA", kelas: "A" }).success).toBe(false);
    expect(santriSchema.safeParse({ nama: "Ali", jenjang: "X", kelas: "A" }).success).toBe(false);
    expect(santriSchema.safeParse({ nama: "Ali", jenjang: "TPA", kelas: "B" }).success).toBe(true);
  });

  it("transaksiSchema menolak jumlah <= 0", () => {
    const ok = transaksiSchema.safeParse({
      jenis: "PEMASUKAN", kategoriId: "k1", jumlah: 50000, tanggal: new Date(),
    });
    const bad = transaksiSchema.safeParse({
      jenis: "PEMASUKAN", kategoriId: "k1", jumlah: 0, tanggal: new Date(),
    });
    expect(ok.success).toBe(true);
    expect(bad.success).toBe(false);
  });

  it("pembayaranSppSchema menerima array bulan (multi-bulan)", () => {
    const res = pembayaranSppSchema.safeParse({
      santriId: "s1",
      bulan: [new Date(2026, 6, 1), new Date(2026, 7, 1)],
      nominal: 75000,
      metode: "TUNAI",
    });
    expect(res.success).toBe(true);
  });

  it("pembayaranSppSchema menolak array bulan kosong", () => {
    const res = pembayaranSppSchema.safeParse({ santriId: "s1", bulan: [], nominal: 75000 });
    expect(res.success).toBe(false);
  });
});

describe("formatRupiah", () => {
  it("format angka pakai id-ID", () => {
    expect(formatRupiah(75000)).toMatch(/Rp\s*75\.000/);
    expect(formatRupiah(0)).toMatch(/Rp\s*0/);
  });
});

// Logika tunggakan (mirip getProfilSantri): bulan Juli..bulan lalu yang belum lunas
function hitungTunggakan(lunasSet: Set<string>, now: Date): number {
  const bulanIni = new Date(now.getFullYear(), now.getMonth(), 1);
  const tahunAjar = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  let n = 0;
  for (let d = new Date(tahunAjar, 6, 1); d < bulanIni; d.setMonth(d.getMonth() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!lunasSet.has(key)) n++;
  }
  return n;
}

describe("logika tunggakan", () => {
  const now = new Date(2026, 7, 3); // 3 Agustus 2026

  it("tanpa pembayaran: tunggakan = Juli (1 bulan)", () => {
    expect(hitungTunggakan(new Set(), now)).toBe(1);
  });

  it("Juli lunas, Agustus belum: tunggakan 0", () => {
    expect(hitungTunggakan(new Set(["2026-07"]), now)).toBe(0);
  });

  it("Januari 2027: tunggakan Jul-Des 2026 = 6", () => {
    const jan = new Date(2027, 0, 5);
    expect(hitungTunggakan(new Set(), jan)).toBe(6);
  });
});
