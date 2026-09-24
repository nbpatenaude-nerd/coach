const pg = require('pg');
const client = new pg.Client('postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway');

client.connect().then(async () => {
  const ws = await client.query(`SELECT count(*) FROM "Workout"`);
  console.log('Total Workouts in Staging:', ws.rows[0].count);
  client.end();
}).catch(console.error);
