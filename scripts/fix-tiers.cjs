const pg = require('pg');

const prodUrl = 'postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway';
const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';

async function main() {
  const prod = new pg.Client(prodUrl);
  const staging = new pg.Client(stagingUrl);
  await prod.connect();
  await staging.connect();

  console.log('Adding missing enum values to SubscriptionTier on Staging...');
  const tiers = ['UNCOVER', 'UNLOCK', 'UNLEASH'];
  for (const tier of tiers) {
    try {
      await staging.query(`ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS '${tier}'`);
      console.log(`  Added ${tier}`);
    } catch (e) {
      console.error(`  Error adding ${tier}:`, e.message);
    }
  }

  console.log('\nRestoring correct subscription tiers from Production...');
  
  const prodUsers = await prod.query(`SELECT email, "subscriptionTier" FROM "User" WHERE "subscriptionTier"::text IN ('UNCOVER', 'UNLOCK', 'UNLEASH')`);
  console.log(`Found ${prodUsers.rows.length} user(s) with legacy tiers in Production.`);

  let updated = 0;
  for (const user of prodUsers.rows) {
    const res = await staging.query(`UPDATE "User" SET "subscriptionTier" = $1::"SubscriptionTier" WHERE email = $2`, [user.subscriptionTier, user.email]);
    if (res.rowCount > 0) {
      updated++;
    }
  }
  
  console.log(`Successfully restored tiers for ${updated} user(s) in Staging!`);

  await prod.end();
  await staging.end();
}

main().catch(console.error);
