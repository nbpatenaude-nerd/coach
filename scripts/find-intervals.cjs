const pg = require('pg');
const client = new pg.Client('postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway');

client.connect().then(async () => {
  const ints = await client.query(`
    SELECT i.provider, i."externalUserId", u.email 
    FROM "Integration" i
    LEFT JOIN "User" u ON u.id = i."userId"
    WHERE i.provider = 'intervals'
  `);
  console.log('Intervals integrations in PROD:', ints.rows);

  const users = await client.query(`
    SELECT email, "intervalsApiKey", "intervalsAthleteId"
    FROM "User" 
    WHERE "intervalsApiKey" IS NOT NULL OR "intervalsAthleteId" IS NOT NULL
  `);
  console.log('Users with intervals fields directly in PROD:', users.rows);

  client.end();
}).catch(console.error);
