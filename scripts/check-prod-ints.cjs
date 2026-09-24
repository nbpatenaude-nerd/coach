const pg = require('pg');
const client = new pg.Client('postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway');

client.connect().then(async () => {
  const adminInts = await client.query(`SELECT provider, "externalUserId" FROM "Integration" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'info@trinerds.com')`);
  console.log('Integrations in prod for info@trinerds.com:', adminInts.rows);
  client.end();
}).catch(console.error);
