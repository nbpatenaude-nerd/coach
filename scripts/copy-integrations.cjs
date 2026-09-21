const pg = require('pg');
const copyStreams = require('pg-copy-streams');
const { pipeline } = require('stream/promises');

const prodUrl = 'postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway';
const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';

async function main() {
  const prod = new pg.Client(prodUrl);
  const staging = new pg.Client(stagingUrl);
  await prod.connect();
  await staging.connect();

  const getCols = `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`;
  const prodCols = (await prod.query(getCols, ['Integration'])).rows.map(r => r.column_name);
  const stagingCols = (await staging.query(getCols, ['Integration'])).rows.map(r => r.column_name);
  const commonCols = prodCols.filter(c => stagingCols.includes(c));
  const colString = commonCols.map(c => `"${c}"`).join(', ');

  console.log('Copying Integration table...');
  await staging.query(`ALTER TABLE "Integration" DISABLE TRIGGER ALL`);
  await staging.query(`TRUNCATE TABLE "Integration" CASCADE`);
  
  const streamFrom = prod.query(copyStreams.to(`COPY (SELECT ${colString} FROM "Integration") TO STDOUT`));
  const streamTo = staging.query(copyStreams.from(`COPY "Integration" (${colString}) FROM STDIN`));
  await pipeline(streamFrom, streamTo);
  
  await staging.query(`ALTER TABLE "Integration" ENABLE TRIGGER ALL`);

  const count = await staging.query(`SELECT COUNT(*) FROM "Integration"`);
  console.log(`Done! ${count.rows[0].count} integration rows copied.`);
  
  await prod.end();
  await staging.end();
}

main().catch(console.error);
