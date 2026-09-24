-- AlterTable User
ALTER TABLE "User" ADD COLUMN "hashedPassword" TEXT;

-- Clear Account and Session tables to allow adding NOT NULL id without default
TRUNCATE TABLE "Account" CASCADE;
TRUNCATE TABLE "Session" CASCADE;

-- AlterTable Account
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey";
ALTER TABLE "Account" DROP COLUMN "createdAt";
ALTER TABLE "Account" DROP COLUMN "updatedAt";
ALTER TABLE "Account" ADD COLUMN "id" TEXT NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "refresh_token" TYPE TEXT;
ALTER TABLE "Account" ALTER COLUMN "access_token" TYPE TEXT;
ALTER TABLE "Account" ALTER COLUMN "id_token" TYPE TEXT;
ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- AlterTable Session
ALTER TABLE "Session" DROP COLUMN "createdAt";
ALTER TABLE "Session" DROP COLUMN "updatedAt";
ALTER TABLE "Session" ADD COLUMN "id" TEXT NOT NULL;
ALTER TABLE "Session" ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable VerificationToken
ALTER TABLE "VerificationToken" DROP CONSTRAINT "VerificationToken_pkey";
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateTable PasswordResetToken
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex PasswordResetToken
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");
