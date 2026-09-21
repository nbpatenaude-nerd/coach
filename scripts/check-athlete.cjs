const pg = require('pg');
const client = new pg.Client('postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway');

client.connect().then(async () => {
  const user = await client.query(`SELECT email, "intervalsApiKey", "intervalsAthleteId" FROM "User" WHERE email = 'n.b.patenaude@gmail.com'`);
  console.log(user.rows[0]);
  
  const integrations = await client.query(`SELECT provider, "externalUserId" FROM "Integration" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'n.b.patenaude@gmail.com')`);
  console.log('Integrations:', integrations.rows);

  client.end();
}).catch(console.error);
