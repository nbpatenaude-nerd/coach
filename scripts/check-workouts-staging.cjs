const pg = require('pg');
const client = new pg.Client('postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway');

client.connect().then(async () => {
  const ws = await client.query(`SELECT count(*) FROM "Workout" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'n.b.patenaude@gmail.com')`);
  console.log('Workouts:', ws.rows[0].count);
  client.end();
}).catch(console.error);
