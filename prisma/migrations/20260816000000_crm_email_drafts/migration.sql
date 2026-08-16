-- CreateTable
CREATE TABLE "CrmEmailDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "promptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmEmailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmEmailDraft_userId_idx" ON "CrmEmailDraft"("userId");

-- AddForeignKey
ALTER TABLE "CrmEmailDraft" ADD CONSTRAINT "CrmEmailDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
