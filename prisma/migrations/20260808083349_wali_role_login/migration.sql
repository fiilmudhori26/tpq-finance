-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'WALI';

-- AlterTable
ALTER TABLE "Santri" ADD COLUMN     "waliUserId" TEXT;

-- CreateIndex
CREATE INDEX "Santri_waliUserId_idx" ON "Santri"("waliUserId");

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_waliUserId_fkey" FOREIGN KEY ("waliUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
