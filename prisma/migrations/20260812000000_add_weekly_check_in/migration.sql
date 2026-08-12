-- AlterTable
ALTER TABLE "User" ADD COLUMN "aiWorkoutAutonomyLimit" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "coachId" TEXT,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feelingScore" INTEGER,
    "fatigueScore" INTEGER,
    "stressScore" INTEGER,
    "sleepQuality" INTEGER,
    "notes" TEXT,
    "coachFeedback" TEXT,
    "coachReviewedAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_athleteId_idx" ON "WeeklyCheckIn"("athleteId");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_coachId_idx" ON "WeeklyCheckIn"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCheckIn_athleteId_weekStartDate_key" ON "WeeklyCheckIn"("athleteId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
