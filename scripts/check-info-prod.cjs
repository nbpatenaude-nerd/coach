const pg = require('pg');
const client = new pg.Client('postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway');

client.connect().then(async () => {
  const user = await client.query(`SELECT email, "intervalsApiKey", "intervalsAthleteId" FROM "User" WHERE email = 'info@trinerds.com'`);
  console.log(user.rows[0]);
  client.end();
}).catch(console.error);
