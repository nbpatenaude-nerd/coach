const pg = require('pg');

const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';

const client = new pg.Client(stagingUrl);
client.connect().then(async () => {
  const res = await client.query(`UPDATE "User" SET role = 'ADMIN' WHERE email = 'info@trinerds.ca' OR "isAdmin" = true`);
  console.log(`Set ADMIN role on ${res.rowCount} user(s)`);
  
  const check = await client.query(`SELECT email, role, "isAdmin" FROM "User" WHERE email = 'info@trinerds.ca'`);
  console.log('Your account:', check.rows[0]);
  
  await client.end();
}).catch(console.error);
