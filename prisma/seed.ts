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

type BulanSeed = "Jan" | "Feb" | "Mar" | "Apr" | "Mei";

// Santri + bulan SPP yang lunas (tahun ajaran 2025/2026). Semua tanpa wali/HP.
const SANTRI: { nama: string; bulan: BulanSeed[] }[] = [
  { nama: "Azam", bulan: ["Mei"] },
  { nama: "Alek", bulan: ["Mei"] },
  { nama: "Arul", bulan: ["Mei"] },
  { nama: "Aira", bulan: ["Mei"] },
  { nama: "Alesa", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Afka", bulan: ["Mar"] },
  { nama: "Abe", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Adam", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Attar", bulan: ["Mei"] },
  { nama: "Aisyah", bulan: ["Apr", "Mei"] },
  { nama: "Agil", bulan: ["Jan", "Feb", "Mar", "Apr", "Mei"] },
  { nama: "Tama", bulan: ["Jan", "Feb", "Mar", "Apr"] },
  { nama: "Agha", bulan: ["Apr", "Mei"] },
  { nama: "Alif", bulan: ["Mei"] },
  { nama: "Basyar", bulan: ["Mei"] },
  { nama: "Balqis", bulan: ["Apr", "Mei"] },
  { nama: "Dasel", bulan: ["Mei"] },
  { nama: "Delon", bulan: ["Feb", "Mar", "Apr", "Mei"] },
  { nama: "Dika", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Egar", bulan: ["Jan", "Feb", "Mar", "Apr", "Mei"] },
  { nama: "Fanya", bulan: ["Mei"] },
  { nama: "Fahru", bulan: ["Mei"] },
  { nama: "Fahar", bulan: ["Apr", "Mei"] },
  { nama: "Fatih", bulan: ["Feb", "Mar", "Apr", "Mei"] },
  { nama: "Farhan", bulan: ["Apr", "Mei"] },
  { nama: "Gilang", bulan: ["Mei"] },
  { nama: "Ila", bulan: ["Mei"] },
  { nama: "Iqbal", bulan: ["Feb", "Mar", "Apr", "Mei"] },
  { nama: "Izzan", bulan: ["Mei"] },
  { nama: "Kevin", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Khimora", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Keana", bulan: ["Mei"] },
  { nama: "Myesel", bulan: ["Feb", "Mar", "Apr"] },
  { nama: "Cello", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "MD", bulan: ["Jan", "Feb", "Mar", "Apr", "Mei"] },
  { nama: "Muzammil", bulan: ["Apr", "Mei"] },
  { nama: "Naya", bulan: ["Mei"] },
  { nama: "Nares", bulan: ["Mei"] },
  { nama: "Putri 1", bulan: ["Mei"] },
  { nama: "Rajoo", bulan: ["Mei"] },
  { nama: "Rizal", bulan: ["Apr", "Mei"] },
  { nama: "Tazakka", bulan: ["Jan", "Feb", "Mar", "Apr", "Mei"] },
  { nama: "Revalita", bulan: ["Mei"] },
  { nama: "Reinata", bulan: ["Mei"] },
  { nama: "Gani", bulan: ["Feb", "Mar", "Apr", "Mei"] },
  { nama: "Rafa", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Arya", bulan: ["Apr", "Mei"] },
  { nama: "Jenita", bulan: ["Mar", "Apr", "Mei"] },
  { nama: "Aluna", bulan: ["Mei"] },
  { nama: "Senja", bulan: ["Apr", "Mei"] },
  { nama: "Bunga", bulan: ["Mei"] },
  { nama: "Arsene", bulan: ["Feb", "Mar", "Apr", "Mei"] },
];

const TAHUN_AJAR = "2025/2026";
const TAHUN = 2026; // Jan–Mei 2026

async function main() {
  // 1. Reset tenant aktif (Darul Qur'an) dulu. Wajib sebelum Al-Ikhlas: transaksi lama
  //    tenant ini dibuat oleh user tenant Al-Ikhlas (data inkonsisten seed lama), sehingga
  //    kalau Al-Ikhlas dihapus duluan, FK createdById → User Al-Ikhlas masih dirujuk.
  const newTenant = await prisma.tenant.findUnique({ where: { slug: "tpq-darul-quran" } });
  if (newTenant) {
    const tid = newTenant.id;
    await prisma.waliToken.deleteMany({ where: { tenantId: tid } });
    await prisma.auditLog.deleteMany({ where: { tenantId: tid } });
    await prisma.pembayaran.deleteMany({ where: { tenantId: tid } });
    await prisma.transaksi.deleteMany({ where: { tenantId: tid } });
    await prisma.santri.deleteMany({ where: { tenantId: tid } });
    await prisma.sppRate.deleteMany({ where: { tenantId: tid } });
    await prisma.kategori.deleteMany({ where: { tenantId: tid } });
    await prisma.pengaturan.deleteMany({ where: { tenantId: tid } });
    await prisma.user.deleteMany({ where: { tenantId: tid } });
    await prisma.tenant.delete({ where: { id: tid } });
  }

  // 2. Hapus tenant lama (Al-Ikhlas) beserta semua datanya — clean slate.
  //    Pakai tenantId langsung (filter relasi tak aman utk deleteMany).
  const oldTenant = await prisma.tenant.findUnique({ where: { slug: "tpq-al-ikhlas" } });
  if (oldTenant) {
    const tid = oldTenant.id;
    await prisma.waliToken.deleteMany({ where: { tenantId: tid } });
    await prisma.auditLog.deleteMany({ where: { tenantId: tid } });
    // Transaksi harus dihapus dulu (FK createdById → User)
    await prisma.transaksi.deleteMany({ where: { tenantId: tid } });
    await prisma.pembayaran.deleteMany({ where: { tenantId: tid } });
    await prisma.santri.deleteMany({ where: { tenantId: tid } });
    await prisma.sppRate.deleteMany({ where: { tenantId: tid } });
    await prisma.kategori.deleteMany({ where: { tenantId: tid } });
    await prisma.pengaturan.deleteMany({ where: { tenantId: tid } });
    await prisma.user.deleteMany({ where: { tenantId: tid } });
    await prisma.tenant.delete({ where: { id: tid } });
  }

  // 2. Tenant "TPQ Darul Qur'an"
  const tenant = await prisma.tenant.upsert({
    where: { slug: "tpq-darul-quran" },
    update: { nama: "TPQ Darul Qur'an", alamat: "Jember, Jawa Timur" },
    create: {
      slug: "tpq-darul-quran",
      nama: "TPQ Darul Qur'an",
      alamat: "Jember, Jawa Timur",
    },
  });

  // 3. User admin
  const email = process.env.SEED_ADMIN_EMAIL ?? "tpqdarulquran@gmail.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await hashPassword(password);
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

  // 4. Kategori default
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
        tenantId_jenis_nama: { tenantId: tenant.id, jenis: k.jenis, nama: k.nama },
      },
      update: {},
      create: { ...k, tenantId: tenant.id, isDefault: true },
    });
  }

  // 5. SPP rate per jenjang (tahun ajaran baru)
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
          tahunAjaran: TAHUN_AJAR,
        },
      },
      update: {},
      create: { ...r, tenantId: tenant.id, tahunAjaran: TAHUN_AJAR },
    });
  }

  // 6. Santri baru (53) — tanpa wali/HP
  const rateMap = new Map(rates.map((r) => [r.jenjang, r.nominal]));
  const katSpp = (
    await prisma.kategori.findUniqueOrThrow({
      where: {
        tenantId_jenis_nama: { tenantId: tenant.id, jenis: "PEMASUKAN", nama: "SPP Santri" },
      },
    })
  ).id;

  const BULAN_INDEX: Record<BulanSeed, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4 };
  const JENJANG: ("TKA" | "TPA" | "TQA")[] = ["TKA", "TPA", "TQA"];

  let noUrut = 1;
  let totalPembayaran = 0;
  for (const s of SANTRI) {
    const noInduk = `${TAHUN}${String(noUrut).padStart(3, "0")}`;
    const jenjang = JENJANG[noUrut % 3]; // rotasi merata
    const santri = await prisma.santri.create({
      data: {
        tenantId: tenant.id,
        noInduk,
        nama: s.nama,
        jenjang,
        kelas: jenjang === "TKA" ? "Alif" : jenjang === "TPA" ? "Ba" : "Ta",
      },
    });
    // Pembayaran SPP per bulan lunas
    const nominal = rateMap.get(jenjang)!;
    for (const b of s.bulan) {
      const tanggal = new Date(TAHUN, BULAN_INDEX[b], 5, 10, 0, 0);
      const transaksi = await prisma.transaksi.create({
        data: {
          tenantId: tenant.id,
          jenis: "PEMASUKAN",
          kategoriId: katSpp,
          sumber: s.nama,
          keterangan: `SPP ${s.nama} ${tanggal.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
          jumlah: nominal,
          tanggal,
          createdById: user.id,
        },
      });
      await prisma.pembayaran.create({
        data: {
          tenantId: tenant.id,
          santriId: santri.id,
          transaksiId: transaksi.id,
          noReferensi: `#TRX-${String(1000 + totalPembayaran)}-B`,
          bulan: new Date(TAHUN, BULAN_INDEX[b], 1),
          nominal,
          paidAt: tanggal,
          createdById: user.id,
        },
      });
      totalPembayaran++;
    }
    noUrut++;
  }

  // 7. Akun wali demo (login email+password)
  const waliEmail = "wali.demo@tpq.test";
  const waliPasswordHash = await hashPassword("wali1234");
  const firstSantri = await prisma.santri.findFirstOrThrow({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "asc" },
  });
  const waliUser = await prisma.user.upsert({
    where: { email: waliEmail },
    update: { role: "WALI" },
    create: {
      tenantId: tenant.id,
      name: "Wali Demo",
      email: waliEmail,
      emailVerified: true,
      role: "WALI",
    },
  });
  const waliAccount = await prisma.account.findFirst({
    where: { userId: waliUser.id, providerId: "credential" },
  });
  if (waliAccount) {
    await prisma.account.update({
      where: { id: waliAccount.id },
      data: { password: waliPasswordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: waliUser.id,
        providerId: "credential",
        accountId: waliUser.id,
        password: waliPasswordHash,
      },
    });
  }
  await prisma.santri.update({
    where: { id: firstSantri.id },
    data: { waliUserId: waliUser.id },
  });

  console.log(
    `Seed OK: tenant=${tenant.slug}, santri=${SANTRI.length}, pembayaran=${totalPembayaran}, tahunAjaran=${TAHUN_AJAR}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
