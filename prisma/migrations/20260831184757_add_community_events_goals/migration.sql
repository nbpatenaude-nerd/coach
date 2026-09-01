-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionTier_new" AS ENUM ('FREE', 'UNCOVER', 'UNLOCK', 'UNLEASH');
ALTER TABLE "public"."User" ALTER COLUMN "subscriptionTier" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier_new" USING ("subscriptionTier"::text::"SubscriptionTier_new");
ALTER TABLE "User" ALTER COLUMN "pendingSubscriptionTier" TYPE "SubscriptionTier_new" USING ("pendingSubscriptionTier"::text::"SubscriptionTier_new");
ALTER TABLE "QuotaDenial" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::text::"SubscriptionTier_new");
ALTER TABLE "PartnerCampaign" ALTER COLUMN "grantedTier" TYPE "SubscriptionTier_new" USING ("grantedTier"::text::"SubscriptionTier_new");
ALTER TABLE "PartnerCampaignRedemption" ALTER COLUMN "grantedTier" TYPE "SubscriptionTier_new" USING ("grantedTier"::text::"SubscriptionTier_new");
ALTER TABLE "ProviderSubscription" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::text::"SubscriptionTier_new");
ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
DROP TYPE "public"."SubscriptionTier_old";
ALTER TABLE "User" ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "EventParticipant" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "raceReport" TEXT,
ADD COLUMN     "resultPosition" INTEGER,
ADD COLUMN     "resultTime" INTEGER;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "completionLevel" TEXT,
ADD COLUMN     "completionNotes" TEXT;

-- CreateTable
CREATE TABLE "EventMessage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventMessage_eventId_idx" ON "EventMessage"("eventId");

-- CreateIndex
CREATE INDEX "EventMessage_userId_idx" ON "EventMessage"("userId");

-- AddForeignKey
ALTER TABLE "EventMessage" ADD CONSTRAINT "EventMessage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMessage" ADD CONSTRAINT "EventMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


