/*
  Warnings:

  - You are about to drop the column `city` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `village` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "district",
DROP COLUMN "province",
DROP COLUMN "village",
ADD COLUMN     "regionId" TEXT;

-- CreateIndex
CREATE INDEX "Company_regionId_idx" ON "Company"("regionId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
