-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "userId" TEXT;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_email_key" UNIQUE ("email");
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_key" UNIQUE ("userId");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
