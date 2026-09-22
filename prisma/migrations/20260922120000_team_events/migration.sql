-- CreateEnum
CREATE TYPE "TeamEventShareLevel" AS ENUM ('FULL', 'SUMMARY');

-- CreateTable
CREATE TABLE "TeamEvent" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamEventParticipant" (
    "id" TEXT NOT NULL,
    "teamEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priority" TEXT DEFAULT 'B',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamEventParticipant_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "teamEventId" TEXT;

-- CreateIndex
CREATE INDEX "TeamEvent_date_idx" ON "TeamEvent"("date");

-- CreateIndex
CREATE INDEX "TeamEvent_isPinned_date_idx" ON "TeamEvent"("isPinned", "date");

-- CreateIndex
CREATE INDEX "TeamEvent_createdById_idx" ON "TeamEvent"("createdById");

-- CreateIndex
CREATE INDEX "TeamEventParticipant_userId_idx" ON "TeamEventParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamEventParticipant_teamEventId_userId_key" ON "TeamEventParticipant"("teamEventId", "userId");

-- CreateIndex
CREATE INDEX "Event_teamEventId_idx" ON "Event"("teamEventId");

-- CreateIndex
CREATE INDEX "Event_isPublic_date_idx" ON "Event"("isPublic", "date");

-- AddForeignKey
ALTER TABLE "TeamEvent" ADD CONSTRAINT "TeamEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEvent" ADD CONSTRAINT "TeamEvent_pinnedById_fkey" FOREIGN KEY ("pinnedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEventParticipant" ADD CONSTRAINT "TeamEventParticipant_teamEventId_fkey" FOREIGN KEY ("teamEventId") REFERENCES "TeamEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEventParticipant" ADD CONSTRAINT "TeamEventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_teamEventId_fkey" FOREIGN KEY ("teamEventId") REFERENCES "TeamEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: one TeamEvent per existing public Event (earliest wins for same day+title later via app grouping)
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
WHERE e."isPublic" = true;

UPDATE "Event" e
SET "teamEventId" = e."id"
WHERE e."isPublic" = true;

INSERT INTO "TeamEventParticipant" ("id", "teamEventId", "userId", "priority", "createdAt")
SELECT e."id", e."teamEventId", e."userId", e."priority", NOW()
FROM "Event" e
WHERE e."isPublic" = true AND e."teamEventId" IS NOT NULL
ON CONFLICT ("teamEventId", "userId") DO NOTHING;

INSERT INTO "TeamEventParticipant" ("id", "teamEventId", "userId", "priority", "createdAt")
SELECT ep."id", e."id", ep."userId", ep."priority", ep."createdAt"
FROM "EventParticipant" ep
JOIN "Event" e ON e."id" = ep."eventId"
WHERE e."isPublic" = true
ON CONFLICT ("teamEventId", "userId") DO NOTHING;
