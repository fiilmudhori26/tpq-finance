import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
import { hashPassword } from "@better-auth/utils/password";

function poolFromUrl() {
  const u = new URL(process.env.DATABASE_URL!);
  return new Pool({
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });
}

const adapter = new PrismaPg(poolFromUrl());
const prisma = new PrismaClient({ adapter });

async function main() {
  // Idempotent: hapus data lama tenant sebelum seed ulang (anak → induk)
  await prisma.auditLog.deleteMany({});
  await prisma.pembayaran.deleteMany({});
  await prisma.transaksi.deleteMany({});
  await prisma.santri.deleteMany({});
  await prisma.sppRate.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.pengaturan.deleteMany({});

  const tenant = await prisma.tenant.upsert({
    where: { slug: "tpq-al-ikhlas" },
    update: {},
    create: {
      slug: "tpq-al-ikhlas",
      nama: "TPQ Al-Ikhlas",
      alamat: "Jember, Jawa Timur",
    },
  });

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@tpq.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await hashPassword(password);

  // User dibuat manual + hash ada di Account.password (konvensi Better Auth).
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Super Admin" },
    create: {
      tenantId: tenant.id,
      name: "Super Admin",
      email,
      emailVerified: true,
      role: "SUPER_ADMIN",
    },
  });
  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
      },
    });
  }

  const kategori = [
    { nama: "SPP Santri", jenis: "PEMASUKAN" as const },
    { nama: "Donasi", jenis: "PEMASUKAN" as const },
    { nama: "Infaq", jenis: "PEMASUKAN" as const },
    { nama: "Sewa Aset", jenis: "PEMASUKAN" as const },
    { nama: "Gaji/Honor", jenis: "PENGELUARAN" as const },
    { nama: "Operasional", jenis: "PENGELUARAN" as const },
    { nama: "Perawatan", jenis: "PENGELUARAN" as const },
    { nama: "Lain-lain", jenis: "PENGELUARAN" as const },
  ];
  for (const k of kategori) {
    await prisma.kategori.upsert({
      where: {
        tenantId_jenis_nama: {
          tenantId: tenant.id,
          jenis: k.jenis,
          nama: k.nama,
        },
      },
      update: {},
      create: { ...k, tenantId: tenant.id, isDefault: true },
    });
  }

  const rates: { jenjang: "TKA" | "TPA" | "TQA"; nominal: number }[] = [
    { jenjang: "TKA", nominal: 50_000 },
    { jenjang: "TPA", nominal: 75_000 },
    { jenjang: "TQA", nominal: 100_000 },
  ];
  for (const r of rates) {
    await prisma.sppRate.upsert({
      where: {
        tenantId_jenjang_tahunAjaran: {
          tenantId: tenant.id,
          jenjang: r.jenjang,
          tahunAjaran: "2024/2025",
        },
      },
      update: {},
      create: { ...r, tenantId: tenant.id, tahunAjaran: "2024/2025" },
    });
  }

  // --- Data dummy: santri ---
  const santriSeed: {
    nama: string;
    jenjang: "TKA" | "TPA" | "TQA";
    kelas: string;
    namaWali: string;
    noHpWali: string;
  }[] = [
    { nama: "Aisyah Putri", jenjang: "TPA", kelas: "Ba", namaWali: "Ibu Siti Rahma", noHpWali: "081234567801" },
    { nama: "Muhammad Rizki", jenjang: "TQA", kelas: "Ta", namaWali: "Bapak Ahmad Fauzi", noHpWali: "081234567802" },
    { nama: "Siti Nurhaliza", jenjang: "TKA", kelas: "Alif", namaWali: "Ibu Dewi Lestari", noHpWali: "081234567803" },
    { nama: "Ahmad Fadlan", jenjang: "TPA", kelas: "Alif", namaWali: "Bapak Joko Santoso", noHpWali: "081234567804" },
    { nama: "Nabila Zahra", jenjang: "TKA", kelas: "Ba", namaWali: "Ibu Ratna Sari", noHpWali: "081234567805" },
    { nama: "Hasan Basri", jenjang: "TQA", kelas: "Ta", namaWali: "Bapak Umar Said", noHpWali: "081234567806" },
    { nama: "Zainab Aulia", jenjang: "TPA", kelas: "Ba", namaWali: "Ibu Maimunah", noHpWali: "081234567807" },
    { nama: "Abdullah Syafi", jenjang: "TPA", kelas: "Alif", namaWali: "Bapak Nur Kholis", noHpWali: "081234567808" },
    { nama: "Khadijah Azzahra", jenjang: "TKA", kelas: "Alif", namaWali: "Ibu Halimah", noHpWali: "081234567809" },
    { nama: "Umar Faruq", jenjang: "TQA", kelas: "Ta", namaWali: "Bapak Salim Akbar", noHpWali: "081234567810" },
  ];

  const santriList = [];
  for (let i = 0; i < santriSeed.length; i++) {
    const s = santriSeed[i];
    const noInduk = `2024${String(i + 1).padStart(3, "0")}`;
    const santri = await prisma.santri.upsert({
      where: { tenantId_noInduk: { tenantId: tenant.id, noInduk } },
      update: {},
      create: { ...s, tenantId: tenant.id, noInduk },
    });
    santriList.push(santri);
  }

  // --- Data dummy: transaksi pemasukan/pengeluaran + pembayaran SPP (BR-03) ---
  const katMap = new Map(
    (await prisma.kategori.findMany({ where: { tenantId: tenant.id } })).map((k) => [`${k.jenis}:${k.nama}`, k])
  );
  const katSpp = katMap.get("PEMASUKAN:SPP Santri")!;
  const katDonasi = katMap.get("PEMASUKAN:Donasi")!;
  const katInfaq = katMap.get("PEMASUKAN:Infaq")!;
  const katOperasional = katMap.get("PENGELUARAN:Operasional")!;
  const katGaji = katMap.get("PENGELUARAN:Gaji/Honor")!;

  const now = new Date();
  const tahun = now.getFullYear();
  const bulan = now.getMonth();
  // Kemarin (WIB) — dijamin ≤ now walau jam berapapun, aman dari CHECK BR-12
  const kemarin = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0);
  const tgl = (hari: number, bulanOffset = 0) =>
    new Date(tahun, bulan + bulanOffset, hari, 10, 0, 0);

  // Transaksi non-SPP (pemasukan & pengeluaran)
  const transaksiUmum: {
    jenis: "PEMASUKAN" | "PENGELUARAN";
    kategori: typeof katDonasi;
    sumber: string;
    keterangan: string;
    jumlah: number;
    tanggal: Date;
  }[] = [
    { jenis: "PEMASUKAN", kategori: katDonasi, sumber: "Hamba Allah", keterangan: "Donasi pembangunan", jumlah: 250_000, tanggal: tgl(12, -1) },
    { jenis: "PEMASUKAN", kategori: katInfaq, sumber: "Kotak Amal", keterangan: "Infaq Jumat", jumlah: 180_000, tanggal: tgl(9, -1) },
    { jenis: "PENGELUARAN", kategori: katOperasional, sumber: "Operasional", keterangan: "Listrik dan air", jumlah: 350_000, tanggal: tgl(10, -1) },
    { jenis: "PENGELUARAN", kategori: katOperasional, sumber: "Operasional", keterangan: "Buku dan alat tulis", jumlah: 120_000, tanggal: tgl(7, -1) },
    { jenis: "PENGELUARAN", kategori: katGaji, sumber: "Gaji/Honor", keterangan: "Honor ustadz bulan lalu", jumlah: 1_200_000, tanggal: tgl(5, -1) },
    { jenis: "PEMASUKAN", kategori: katDonasi, sumber: "Yayasan Nurul Huda", keterangan: "Bantuan operasional", jumlah: 500_000, tanggal: tgl(3, -1) },
    // Bulan berjalan (dashboard "Bulan Ini" biar hidup) — tanggal ≤ hari ini (BR-12)
    { jenis: "PEMASUKAN", kategori: katDonasi, sumber: "Hamba Allah", keterangan: "Donasi wakaf Al-Qur'an", jumlah: 300_000, tanggal: tgl(1) },
    { jenis: "PEMASUKAN", kategori: katInfaq, sumber: "Kotak Amal", keterangan: "Infaq Jumat", jumlah: 210_000, tanggal: tgl(2) },
    { jenis: "PENGELUARAN", kategori: katOperasional, sumber: "Operasional", keterangan: "Kebersihan dan ATK", jumlah: 95_000, tanggal: tgl(2) },
  ];

  for (const t of transaksiUmum) {
    await prisma.transaksi.create({
      data: {
        tenantId: tenant.id,
        jenis: t.jenis,
        kategoriId: t.kategori.id,
        sumber: t.sumber,
        keterangan: t.keterangan,
        jumlah: t.jumlah,
        tanggal: t.tanggal,
        createdById: user.id,
      },
    });
  }

  // Pembayaran SPP (BR-03): 1 pembayaran = 1 transaksi pemasukan otomatis
  const bulanIni = new Date(tahun, bulan, 1);
  const bulanLalu = new Date(tahun, bulan - 1, 1);
  const rateMap = new Map(
    (await prisma.sppRate.findMany({ where: { tenantId: tenant.id } })).map((r) => [r.jenjang, Number(r.nominal)])
  );
  let idx = 0;
  for (let i = 0; i < santriList.length; i++) {
    const santri = santriList[i];
    const nominal = rateMap.get(santri.jenjang) ?? 75_000;
    // 7 dari 10 santri bayar bulan lalu (3 tunggakan)
    if (i >= 7) continue;
    const transaksiSpp = await prisma.transaksi.create({
      data: {
        tenantId: tenant.id,
        jenis: "PEMASUKAN",
        kategoriId: katSpp.id,
        sumber: santri.nama,
        keterangan: `SPP ${santri.nama} ${bulanLalu.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
        jumlah: nominal,
        tanggal: tgl(1 + idx, -1),
        createdById: user.id,
      },
    });
    await prisma.pembayaran.create({
      data: {
        tenantId: tenant.id,
        santriId: santri.id,
        transaksiId: transaksiSpp.id,
        noReferensi: `#TRX-${String(100 + idx)}-B`,
        bulan: bulanLalu,
        nominal,
        paidAt: tgl(1 + idx, -1),
        createdById: user.id,
      },
    });
    // 4 dari 7 yang bayar, juga bayar bulan ini (biar ada status Lunas)
    if (i < 4) {
      const transaksiIni = await prisma.transaksi.create({
        data: {
          tenantId: tenant.id,
          jenis: "PEMASUKAN",
          kategoriId: katSpp.id,
          sumber: santri.nama,
          keterangan: `SPP ${santri.nama} ${bulanIni.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
          jumlah: nominal,
          tanggal: kemarin,
          createdById: user.id,
        },
      });
      await prisma.pembayaran.create({
        data: {
          tenantId: tenant.id,
          santriId: santri.id,
          transaksiId: transaksiIni.id,
          noReferensi: `#TRX-${String(200 + i)}-B`,
          bulan: bulanIni,
          nominal,
          paidAt: kemarin,
          createdById: user.id,
        },
      });
    }
    idx++;
  }

  console.log(
    `Seed OK: tenant=${tenant.slug}, kategori=${kategori.length}, sppRate=3, santri=${santriList.length}, transaksi=${transaksiUmum.length + 7}, pembayaran=7`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
