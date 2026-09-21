import pg from 'pg';
import copyStreams from 'pg-copy-streams';
import { pipeline } from 'stream/promises';
const { Client } = pg;
const { from: copyFrom, to: copyTo } = copyStreams;
const prodUrl = 'postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway';
const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';
async function sync() {
    console.log('Connecting to databases...');
    const prod = new Client(prodUrl);
    const staging = new Client(stagingUrl);
    await prod.connect();
    await staging.connect();
    console.log('Connected.');
    const resProd = await prod.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`);
    const prodTables = resProd.rows.map(r => r.tablename);
    const resStaging = await staging.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`);
    const stagingTables = resStaging.rows.map(r => r.tablename);
    const tables = prodTables.filter(t => stagingTables.includes(t));
    console.log('Tables to sync:', tables);
    console.log('Disabling triggers and clearing staging data...');
    // Disable triggers to prevent foreign key issues during insert
    for (const table of tables) {
        await staging.query(`ALTER TABLE "${table}" DISABLE TRIGGER ALL`);
    }
    if (tables.length > 0) {
        const tableList = tables.map(t => `"${t}"`).join(', ');
        await staging.query(`TRUNCATE TABLE ${tableList} CASCADE`);
    }
    // Copy data
    for (const table of tables) {
        console.log(`Copying ${table}...`);
        try {
            const streamFrom = prod.query(copyTo(`COPY "${table}" TO STDOUT`));
            const streamTo = staging.query(copyFrom(`COPY "${table}" FROM STDIN`));
            await pipeline(streamFrom, streamTo);
            console.log(`  -> ${table} synced successfully.`);
        }
        catch (err) {
            console.error(`  -> Failed syncing ${table}:`, err);
        }
    }
    // Re-enable triggers
    console.log('Re-enabling triggers...');
    for (const table of tables) {
        await staging.query(`ALTER TABLE "${table}" ENABLE TRIGGER ALL`);
    }
    await prod.end();
    await staging.end();
    console.log('Sync complete!');
}
sync().catch(console.error);
