-- Rebuild the weekly check-in as a form-driven submission.
--
-- The previous "WeeklyCheckIn" table had fixed score columns and no writer
-- anywhere in the codebase, so it is empty by construction and is dropped
-- rather than migrated. Submissions now store answers as JSON keyed by the
-- field ids in a "CheckInForm" definition (see shared/check-in.ts).

-- CreateEnum
CREATE TYPE "WeeklyCheckInStatus" AS ENUM ('SUBMITTED', 'REVIEWED');

-- DropTable (no rows: nothing ever wrote to this table)
DROP TABLE IF EXISTS "WeeklyCheckIn";

-- CreateTable
CREATE TABLE "CheckInForm" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sections" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckInForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "formId" TEXT,
    "weekStartDate" DATE NOT NULL,
    "responses" JSONB NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "WeeklyCheckInStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coachId" TEXT,
    "coachNotes" TEXT,
    "coachVideoUrl" TEXT,
    "coachVideoAddedAt" TIMESTAMP(3),
    "coachReviewedAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckInForm_slug_key" ON "CheckInForm"("slug");

-- CreateIndex
CREATE INDEX "CheckInForm_isActive_idx" ON "CheckInForm"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCheckIn_athleteId_weekStartDate_key" ON "WeeklyCheckIn"("athleteId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_athleteId_weekStartDate_idx" ON "WeeklyCheckIn"("athleteId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_coachId_status_idx" ON "WeeklyCheckIn"("coachId", "status");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_weekStartDate_status_idx" ON "WeeklyCheckIn"("weekStartDate", "status");

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_formId_fkey" FOREIGN KEY ("formId") REFERENCES "CheckInForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
