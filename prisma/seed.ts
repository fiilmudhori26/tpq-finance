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

  console.log(
    `Seed OK: tenant=${tenant.slug}, kategori=${kategori.length}, sppRate=3`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
