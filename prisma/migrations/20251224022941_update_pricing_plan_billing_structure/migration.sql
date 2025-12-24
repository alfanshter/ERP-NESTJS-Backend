/*
  Warnings:

  - You are about to drop the column `billingPeriod` on the `PricingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `PricingPlan` table. All the data in the column will be lost.
  - Added the required column `monthlyPrice` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearlyPrice` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- Step 1: Add new columns with temporary default
ALTER TABLE "PricingPlan" 
ADD COLUMN "monthlyPrice" DOUBLE PRECISION,
ADD COLUMN "yearlyPrice" DOUBLE PRECISION,
ADD COLUMN "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN "monthlyDiscount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "yearlyDiscount" DOUBLE PRECISION DEFAULT 0;

-- Step 2: Migrate existing data
-- Copy old price to monthlyPrice, and set yearlyPrice = monthlyPrice * 12 (atau set default sesuai keinginan)
UPDATE "PricingPlan" 
SET 
  "monthlyPrice" = "price",
  "yearlyPrice" = "price" * 12;

-- Step 3: Make columns required now that they have values
ALTER TABLE "PricingPlan" 
ALTER COLUMN "monthlyPrice" SET NOT NULL,
ALTER COLUMN "yearlyPrice" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "PricingPlan" 
DROP COLUMN "billingPeriod",
DROP COLUMN "price";
