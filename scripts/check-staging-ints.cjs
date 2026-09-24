const pg = require('pg');
const client = new pg.Client('postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway');

client.connect().then(async () => {
  const integrations = await client.query(`SELECT provider, "externalUserId" FROM "Integration" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'n.b.patenaude@gmail.com')`);
  console.log('Integrations in staging for n.b.patenaude@gmail.com:', integrations.rows);

  const adminInts = await client.query(`SELECT provider, "externalUserId" FROM "Integration" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'info@trinerds.com')`);
  console.log('Integrations in staging for info@trinerds.com:', adminInts.rows);

  client.end();
}).catch(console.error);
