-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'BENDAHARA', 'VIEWER');

-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "StatusTenant" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "Jenjang" AS ENUM ('TKA', 'TPA', 'TQA');

-- CreateEnum
CREATE TYPE "StatusSantri" AS ENUM ('AKTIF', 'TIDAK_AKTIF');

-- CreateEnum
CREATE TYPE "JenisKategori" AS ENUM ('PEMASUKAN', 'PENGELUARAN');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('PEMASUKAN', 'PENGELUARAN');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('LUNAS', 'PROSES', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('LUNAS', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TUNAI', 'TRANSFER');

-- CreateEnum
CREATE TYPE "AksiAudit" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "alamat" VARCHAR(255),
    "status" "StatusTenant" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BENDAHARA',
    "status" "StatusUser" NOT NULL DEFAULT 'AKTIF',
    "lastLoginAt" TIMESTAMP(3),
    "avatarUrl" VARCHAR(255),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Santri" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "noInduk" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "jenjang" "Jenjang" NOT NULL,
    "kelas" VARCHAR(50) NOT NULL,
    "namaWali" VARCHAR(100),
    "noHpWali" VARCHAR(20),
    "status" "StatusSantri" NOT NULL DEFAULT 'AKTIF',
    "keterangan" VARCHAR(255),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jenis" "JenisKategori" NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jenis" "JenisTransaksi" NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "sumber" VARCHAR(150),
    "keterangan" VARCHAR(500),
    "jumlah" DECIMAL(14,0) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'LUNAS',
    "buktiUrl" VARCHAR(255),
    "createdById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "noReferensi" VARCHAR(20) NOT NULL,
    "bulan" TIMESTAMP(3) NOT NULL,
    "nominal" DECIMAL(14,0) NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'LUNAS',
    "metode" "MetodePembayaran" NOT NULL DEFAULT 'TUNAI',
    "paidAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "catatan" VARCHAR(255),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SppRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "jenjang" "Jenjang" NOT NULL,
    "nominal" DECIMAL(14,0) NOT NULL,
    "tahunAjaran" VARCHAR(9) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SppRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "aksi" "AksiAudit" NOT NULL,
    "entitas" VARCHAR(30) NOT NULL,
    "entitasId" VARCHAR(36) NOT NULL,
    "detail" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Santri_tenantId_status_idx" ON "Santri"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Santri_tenantId_jenjang_idx" ON "Santri"("tenantId", "jenjang");

-- CreateIndex
CREATE INDEX "Santri_tenantId_kelas_idx" ON "Santri"("tenantId", "kelas");

-- CreateIndex
CREATE UNIQUE INDEX "Santri_tenantId_noInduk_key" ON "Santri"("tenantId", "noInduk");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_tenantId_jenis_nama_key" ON "Kategori"("tenantId", "jenis", "nama");

-- CreateIndex
CREATE INDEX "Transaksi_tenantId_tanggal_idx" ON "Transaksi"("tenantId", "tanggal");

-- CreateIndex
CREATE INDEX "Transaksi_tenantId_jenis_tanggal_idx" ON "Transaksi"("tenantId", "jenis", "tanggal");

-- CreateIndex
CREATE INDEX "Transaksi_tenantId_kategoriId_idx" ON "Transaksi"("tenantId", "kategoriId");

-- CreateIndex
CREATE INDEX "Transaksi_tenantId_createdAt_idx" ON "Transaksi"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_transaksiId_key" ON "Pembayaran"("transaksiId");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_noReferensi_key" ON "Pembayaran"("noReferensi");

-- CreateIndex
CREATE INDEX "Pembayaran_tenantId_santriId_createdAt_idx" ON "Pembayaran"("tenantId", "santriId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_tenantId_santriId_bulan_key" ON "Pembayaran"("tenantId", "santriId", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "SppRate_tenantId_jenjang_tahunAjaran_key" ON "SppRate"("tenantId", "jenjang", "tahunAjaran");

-- CreateIndex
CREATE UNIQUE INDEX "Pengaturan_tenantId_key_key" ON "Pengaturan"("tenantId", "key");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entitas_entitasId_idx" ON "AuditLog"("tenantId", "entitas", "entitasId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kategori" ADD CONSTRAINT "Kategori_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SppRate" ADD CONSTRAINT "SppRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengaturan" ADD CONSTRAINT "Pengaturan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
