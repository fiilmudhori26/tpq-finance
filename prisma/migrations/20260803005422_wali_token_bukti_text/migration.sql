-- AlterTable
ALTER TABLE "Transaksi" ALTER COLUMN "buktiUrl" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "WaliToken" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaliToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaliToken_santriId_key" ON "WaliToken"("santriId");

-- CreateIndex
CREATE UNIQUE INDEX "WaliToken_token_key" ON "WaliToken"("token");

-- CreateIndex
CREATE INDEX "WaliToken_tenantId_idx" ON "WaliToken"("tenantId");

-- AddForeignKey
ALTER TABLE "WaliToken" ADD CONSTRAINT "WaliToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaliToken" ADD CONSTRAINT "WaliToken_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
