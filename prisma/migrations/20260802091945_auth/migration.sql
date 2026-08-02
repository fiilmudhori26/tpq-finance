-- T03: Konvensi Better Auth — User rename + tabel Session/Account/Verification + CHECK (C1-C4)

-- 1. User: rename kolom + tambah emailVerified
ALTER TABLE "User" RENAME COLUMN "nama" TO "name";
ALTER TABLE "User" RENAME COLUMN "avatarUrl" TO "image";
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" DROP COLUMN "passwordHash";

-- 2. Tabel Better Auth
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" VARCHAR(50) NOT NULL,
    "accountId" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- 3. Index
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Account_providerId_accountId_idx" ON "Account"("providerId", "accountId");

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

CREATE INDEX "Verification_identifier_expiresAt_idx" ON "Verification"("identifier", "expiresAt");

-- 4. FK Better Auth (Cascade)
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. CHECK constraints (C1-C4) — Prisma tanpa syntax CHECK, ditulis manual
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_jumlah_check" CHECK ("jumlah" > 0);
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_tanggal_check" CHECK ("tanggal" <= now());
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_nominal_check" CHECK ("nominal" > 0);
ALTER TABLE "SppRate" ADD CONSTRAINT "SppRate_nominal_check" CHECK ("nominal" > 0);
