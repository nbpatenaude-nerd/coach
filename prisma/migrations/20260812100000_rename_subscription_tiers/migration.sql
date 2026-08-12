-- AlterEnum
BEGIN;
-- Modify SubscriptionTier enum to add UNCOVER, UNLOCK, UNLEASH
ALTER TYPE "SubscriptionTier" ADD VALUE 'UNCOVER';
ALTER TYPE "SubscriptionTier" ADD VALUE 'UNLOCK';
ALTER TYPE "SubscriptionTier" ADD VALUE 'UNLEASH';
COMMIT;

-- Migrate existing data
UPDATE "User" SET "subscriptionTier" = 'UNCOVER' WHERE "subscriptionTier" = 'SUPPORTER';
UPDATE "User" SET "subscriptionTier" = 'UNLEASH' WHERE "subscriptionTier" = 'PRO';

UPDATE "ProviderSubscription" SET "tier" = 'UNCOVER' WHERE "tier" = 'SUPPORTER';
UPDATE "ProviderSubscription" SET "tier" = 'UNLEASH' WHERE "tier" = 'PRO';

-- Remove old values from enum
-- Note: PostgreSQL does not support dropping enum values directly. 
-- We must rename the type, create a new one, and cast.
BEGIN;
CREATE TYPE "SubscriptionTier_new" AS ENUM ('FREE', 'UNCOVER', 'UNLOCK', 'UNLEASH');
ALTER TABLE "User" ALTER COLUMN "subscriptionTier" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier_new" USING ("subscriptionTier"::text::"SubscriptionTier_new");
ALTER TABLE "ProviderSubscription" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::text::"SubscriptionTier_new");
ALTER TABLE "User" ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE';
DROP TYPE "SubscriptionTier";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
COMMIT;
