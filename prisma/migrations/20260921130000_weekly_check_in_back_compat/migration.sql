-- Transitional back-compat shim for the WeeklyCheckIn rebuild.
--
-- 20260921120000_rebuild_weekly_check_in replaced this table's fixed score
-- columns with a JSON `responses` payload. The Prisma client currently running
-- in production was generated from the *old* model, and
-- server/api/coaching/athletes/[id]/check-ins.get.ts calls findMany() without a
-- select, so its generated SQL enumerates the removed columns and fails.
--
-- Re-adding them as nullable makes that query succeed again (it returns no rows
-- either way -- the table has never had a writer). These columns are written by
-- nothing and read only by the old client.
--
-- CONTRACT STEP: drop these six columns in a follow-up migration once the
-- form-driven check-in code is deployed. They are dead weight, not schema.

-- AlterTable
ALTER TABLE "WeeklyCheckIn"
  ADD COLUMN IF NOT EXISTS "feelingScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "fatigueScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "stressScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "sleepQuality" INTEGER,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "coachFeedback" TEXT;
