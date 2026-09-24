-- Team Calendar: TeamEvent + participants.
-- Idempotent so a partially applied / failed deploy can be recovered cleanly.
-- Also creates EventParticipant if missing (present in schema but never migrated).

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TeamEventShareLevel" AS ENUM ('FULL', 'SUMMARY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure legacy EventParticipant exists (schema had it; some DBs never got a migration)
CREATE TABLE IF NOT EXISTS "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priority" TEXT DEFAULT 'B',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "raceReport" TEXT,
    "resultPosition" INTEGER,
    "resultTime" INTEGER,
    "notes" TEXT,
    "targetTime" INTEGER,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventParticipant_eventId_userId_key"
  ON "EventParticipant"("eventId", "userId");
CREATE INDEX IF NOT EXISTS "EventParticipant_userId_idx"
  ON "EventParticipant"("userId");

DO $$ BEGIN
  ALTER TABLE "EventParticipant"
    ADD CONSTRAINT "EventParticipant_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventParticipant"
    ADD CONSTRAINT "EventParticipant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable TeamEvent
CREATE TABLE IF NOT EXISTS "TeamEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "type" TEXT,
    "subType" TEXT,
    "distance" DOUBLE PRECISION,
    "elevation" INTEGER,
    "expectedDuration" DOUBLE PRECISION,
    "terrain" TEXT,
    "city" TEXT,
    "country" TEXT,
    "location" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "websiteUrl" TEXT,
    "shareLevel" "TeamEventShareLevel" NOT NULL DEFAULT 'FULL',
    "hideAttendeeNames" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" TIMESTAMP(3),
    "pinnedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TeamEventParticipant" (
    "id" TEXT NOT NULL,
    "teamEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priority" TEXT DEFAULT 'B',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamEventParticipant_pkey" PRIMARY KEY ("id")
);

-- AlterTable Event.teamEventId
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "teamEventId" TEXT;

CREATE INDEX IF NOT EXISTS "TeamEvent_date_idx" ON "TeamEvent"("date");
CREATE INDEX IF NOT EXISTS "TeamEvent_isPinned_date_idx" ON "TeamEvent"("isPinned", "date");
CREATE INDEX IF NOT EXISTS "TeamEvent_createdById_idx" ON "TeamEvent"("createdById");
CREATE INDEX IF NOT EXISTS "TeamEventParticipant_userId_idx" ON "TeamEventParticipant"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TeamEventParticipant_teamEventId_userId_key"
  ON "TeamEventParticipant"("teamEventId", "userId");
CREATE INDEX IF NOT EXISTS "Event_teamEventId_idx" ON "Event"("teamEventId");
CREATE INDEX IF NOT EXISTS "Event_isPublic_date_idx" ON "Event"("isPublic", "date");

DO $$ BEGIN
  ALTER TABLE "TeamEvent"
    ADD CONSTRAINT "TeamEvent_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TeamEvent"
    ADD CONSTRAINT "TeamEvent_pinnedById_fkey"
    FOREIGN KEY ("pinnedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TeamEventParticipant"
    ADD CONSTRAINT "TeamEventParticipant_teamEventId_fkey"
    FOREIGN KEY ("teamEventId") REFERENCES "TeamEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TeamEventParticipant"
    ADD CONSTRAINT "TeamEventParticipant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Event"
    ADD CONSTRAINT "Event_teamEventId_fkey"
    FOREIGN KEY ("teamEventId") REFERENCES "TeamEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Backfill TeamEvent from public Events (skip rows already present)
INSERT INTO "TeamEvent" (
  "id", "title", "description", "date", "startTime", "type", "subType",
  "distance", "elevation", "expectedDuration", "terrain", "city", "country",
  "location", "isVirtual", "websiteUrl", "shareLevel", "hideAttendeeNames",
  "isPinned", "createdById", "createdAt", "updatedAt"
)
SELECT
  e."id",
  e."title",
  e."description",
  e."date",
  e."startTime",
  e."type",
  e."subType",
  e."distance",
  e."elevation",
  e."expectedDuration",
  e."terrain",
  e."city",
  e."country",
  e."location",
  e."isVirtual",
  e."websiteUrl",
  'FULL'::"TeamEventShareLevel",
  false,
  false,
  e."userId",
  e."createdAt",
  e."updatedAt"
FROM "Event" e
WHERE e."isPublic" = true
ON CONFLICT ("id") DO NOTHING;

UPDATE "Event" e
SET "teamEventId" = e."id"
WHERE e."isPublic" = true
  AND e."teamEventId" IS NULL
  AND EXISTS (SELECT 1 FROM "TeamEvent" t WHERE t."id" = e."id");

-- Creator as team participant
INSERT INTO "TeamEventParticipant" ("id", "teamEventId", "userId", "priority", "createdAt")
SELECT e."id", e."teamEventId", e."userId", e."priority", NOW()
FROM "Event" e
WHERE e."isPublic" = true AND e."teamEventId" IS NOT NULL
ON CONFLICT ("teamEventId", "userId") DO NOTHING;

-- Optional legacy RSVP rows (table now guaranteed to exist)
INSERT INTO "TeamEventParticipant" ("id", "teamEventId", "userId", "priority", "createdAt")
SELECT ep."id", e."id", ep."userId", ep."priority", ep."createdAt"
FROM "EventParticipant" ep
JOIN "Event" e ON e."id" = ep."eventId"
WHERE e."isPublic" = true
ON CONFLICT ("teamEventId", "userId") DO NOTHING;
