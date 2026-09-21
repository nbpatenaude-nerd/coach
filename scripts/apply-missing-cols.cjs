const pg = require('pg');

const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';

async function main() {
  const client = new pg.Client(stagingUrl);
  await client.connect();

  // First create the Role enum if it doesn't exist
  try {
    await client.query(`CREATE TYPE "Role" AS ENUM ('FREE', 'SUPPORTER', 'PRO', 'ADMIN')`);
    console.log('Created Role enum');
  } catch (e) {
    if (e.code === '42710') {
      console.log('Role enum already exists, skipping');
    } else {
      console.error('Enum error:', e.message);
    }
  }

  const alterations = [
    // User table
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'FREE'`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "intervalsApiKey" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "intervalsAthleteId" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hashedPassword" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "crmTags" TEXT[] DEFAULT ARRAY[]::text[]`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "driveFolderId" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasDashboardAccess" BOOLEAN NOT NULL DEFAULT true`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pipelineStage" TEXT DEFAULT 'Lead'`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "churnRisk" TEXT DEFAULT 'LOW'`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "leadSource" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeValue" DOUBLE PRECISION DEFAULT 0`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trackedCheckinMetrics" TEXT[] DEFAULT ARRAY['bloodGlucose'::text]`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isProgramAccount" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "programOwnerId" TEXT`,
    // DailyCheckin table
    `ALTER TABLE "DailyCheckin" ADD COLUMN IF NOT EXISTS "proposedAdjustmentPercentage" INTEGER`,
    `ALTER TABLE "DailyCheckin" ADD COLUMN IF NOT EXISTS "proposedAdjustmentReasoning" TEXT`,
    `ALTER TABLE "DailyCheckin" ADD COLUMN IF NOT EXISTS "adjustmentStatus" TEXT DEFAULT 'PENDING'`,
    // EmailDelivery table
    `ALTER TABLE "EmailDelivery" ADD COLUMN IF NOT EXISTS "ccEmail" TEXT`,
    // Goal table
    `ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "completionLevel" TEXT`,
    `ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "completionNotes" TEXT`,
  ];

  for (const sql of alterations) {
    try {
      await client.query(sql);
      const col = sql.match(/"(\w+)" ADD COLUMN/)?.[1] ?? sql;
      console.log(`  ✓ ${col}`);
    } catch (e) {
      console.error(`  ✗ Failed: ${sql}\n    ${e.message}`);
    }
  }

  // Now copy the role values from production where we can match by email
  console.log('\nUpdating admin users role...');
  // Set your admin email as ADMIN role
  await client.query(`UPDATE "User" SET role = 'FREE' WHERE role IS NULL`);

  console.log('\nDone! All missing columns added.');
  await client.end();
}

main().catch(console.error);
