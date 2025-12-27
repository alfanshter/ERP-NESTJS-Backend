-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "address" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "regionId" TEXT;

-- CreateIndex
CREATE INDEX "Employee_regionId_idx" ON "Employee"("regionId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
