ALTER TABLE "User" ADD COLUMN "trackedCheckinMetrics" TEXT[] DEFAULT ARRAY['bloodGlucose']::TEXT[];
ALTER TABLE "DailyCheckin" ADD COLUMN "proposedAdjustmentPercentage" INTEGER;
ALTER TABLE "DailyCheckin" ADD COLUMN "proposedAdjustmentReasoning" TEXT;
ALTER TABLE "DailyCheckin" ADD COLUMN "adjustmentStatus" TEXT DEFAULT 'PENDING';
