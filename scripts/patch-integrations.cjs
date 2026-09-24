const pg = require('pg');

const prodUrl = 'postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway';
const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';

async function main() {
  const prod = new pg.Client(prodUrl);
  const staging = new pg.Client(stagingUrl);
  await prod.connect();
  await staging.connect();

  // Fetch all users from production that have integration data
  const prodUsers = await prod.query(`
    SELECT 
      email,
      "intervalsApiKey",
      "intervalsAthleteId",
      "isAdmin",
      "role",
      "ftp",
      "maxHr",
      "weight",
      "timezone",
      "uiLanguage",
      "driveFolderId",
      "crmTags",
      "hasDashboardAccess",
      "pipelineStage",
      "churnRisk",
      "leadSource",
      "lifetimeValue",
      "trackedCheckinMetrics",
      "isProgramAccount",
      "programOwnerId"
    FROM "User"
    WHERE "intervalsApiKey" IS NOT NULL OR "intervalsAthleteId" IS NOT NULL OR "isAdmin" = true
  `);

  console.log(`Found ${prodUsers.rows.length} user(s) with integration data in production:`);
  
  let updated = 0;
  for (const user of prodUsers.rows) {
    console.log(`  Patching ${user.email}...`);
    const res = await staging.query(`
      UPDATE "User" SET
        "intervalsApiKey" = $1,
        "intervalsAthleteId" = $2,
        "isAdmin" = $3,
        "role" = $4,
        "ftp" = $5,
        "maxHr" = $6,
        "weight" = $7,
        "timezone" = $8,
        "uiLanguage" = $9,
        "driveFolderId" = $10,
        "crmTags" = $11,
        "hasDashboardAccess" = $12,
        "pipelineStage" = $13,
        "churnRisk" = $14,
        "leadSource" = $15,
        "lifetimeValue" = $16,
        "trackedCheckinMetrics" = $17,
        "isProgramAccount" = $18,
        "programOwnerId" = $19
      WHERE email = $20
    `, [
      user.intervalsApiKey,
      user.intervalsAthleteId,
      user.isAdmin,
      user.role,
      user.ftp,
      user.maxHr,
      user.weight,
      user.timezone,
      user.uiLanguage,
      user.driveFolderId,
      user.crmTags,
      user.hasDashboardAccess,
      user.pipelineStage,
      user.churnRisk,
      user.leadSource,
      user.lifetimeValue,
      user.trackedCheckinMetrics,
      user.isProgramAccount,
      user.programOwnerId,
      user.email
    ]);
    if (res.rowCount > 0) {
      console.log(`    ✓ Patched`);
      updated++;
    } else {
      console.log(`    - Not found in staging (skipped)`);
    }
  }

  // Also check Integration table (for Strava, Google Calendar etc.)
  const integrations = await staging.query(`SELECT COUNT(*) as count FROM "Integration"`);
  console.log(`\nIntegration table rows in staging: ${integrations.rows[0].count}`);
  
  const prodIntegrations = await prod.query(`SELECT COUNT(*) as count FROM "Integration"`);
  console.log(`Integration table rows in production: ${prodIntegrations.rows[0].count}`);

  console.log(`\nDone! Patched ${updated} user(s).`);
  await prod.end();
  await staging.end();
}

main().catch(console.error);
