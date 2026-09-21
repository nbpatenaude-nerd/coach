const pg = require('pg');

const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';
const prodUrl = 'postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway';

async function getColumns(client, table) {
  const res = await client.query(
    `SELECT column_name, data_type, column_default, is_nullable 
     FROM information_schema.columns 
     WHERE table_schema='public' AND table_name=$1 
     ORDER BY ordinal_position`,
    [table]
  );
  return res.rows;
}

async function getTables(client) {
  const res = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations' ORDER BY tablename`
  );
  return res.rows.map(r => r.tablename);
}

async function main() {
  const prod = new pg.Client(prodUrl);
  const staging = new pg.Client(stagingUrl);
  await prod.connect();
  await staging.connect();

  const prodTables = await getTables(prod);
  const stagingTables = await getTables(staging);
  const commonTables = prodTables.filter(t => stagingTables.includes(t));

  const missingCols = [];

  for (const table of commonTables) {
    const prodCols = await getColumns(prod, table);
    const stagingCols = await getColumns(staging, table);
    const stagingColNames = stagingCols.map(c => c.column_name);
    
    for (const col of prodCols) {
      if (!stagingColNames.includes(col.column_name)) {
        missingCols.push({ table, col });
      }
    }
  }

  if (missingCols.length === 0) {
    console.log('No missing columns found!');
  } else {
    console.log(`Found ${missingCols.length} missing column(s):\n`);
    for (const { table, col } of missingCols) {
      console.log(`  "${table}"."${col.column_name}" (${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default})`);
    }
  }

  await prod.end();
  await staging.end();
}

main().catch(console.error);
