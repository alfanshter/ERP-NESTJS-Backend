/*
  Warnings:

  - Added the required column `price` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns (price as nullable first)
ALTER TABLE "Subscription" 
ADD COLUMN "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN "lastPaymentAt" TIMESTAMP(3),
ADD COLUMN "nextBillingAt" TIMESTAMP(3),
ADD COLUMN "price" DOUBLE PRECISION;

-- Step 2: Set default price from plan's monthlyPrice for existing subscriptions
UPDATE "Subscription" s
SET "price" = (
  SELECT p."monthlyPrice" 
  FROM "PricingPlan" p 
  WHERE p.id = s."planId"
)
WHERE "price" IS NULL;

-- Step 3: Make price required
ALTER TABLE "Subscription" 
ALTER COLUMN "price" SET NOT NULL;
