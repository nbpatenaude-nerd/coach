import pg from 'pg';
import copyStreams from 'pg-copy-streams';
import { pipeline } from 'stream/promises';
const { Client } = pg;
const { from: copyFrom, to: copyTo } = copyStreams;
const prodUrl = 'postgresql://postgres:cMNGfDAjtCrFWnzXyuuCJTtutLyAsQUe@sakura.proxy.rlwy.net:13295/railway';
const stagingUrl = 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway';
async function syncFailed() {
    const prod = new Client(prodUrl);
    const staging = new Client(stagingUrl);
    await prod.connect();
    await staging.connect();
    const tablesToFix = ['User', 'DailyCheckin', 'EmailDelivery'];
    for (const table of tablesToFix) {
        console.log(`Fixing ${table}...`);
        // Get columns in both DBs
        const getCols = `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`;
        const prodCols = (await prod.query(getCols, [table])).rows.map(r => r.column_name);
        const stagingCols = (await staging.query(getCols, [table])).rows.map(r => r.column_name);
        // Intersect columns
        const commonCols = prodCols.filter(c => stagingCols.includes(c));
        const colString = commonCols.map(c => `"${c}"`).join(', ');
        await staging.query(`ALTER TABLE "${table}" DISABLE TRIGGER ALL`);
        await staging.query(`TRUNCATE TABLE "${table}" CASCADE`);
        try {
            const streamFrom = prod.query(copyTo(`COPY (SELECT ${colString} FROM "${table}") TO STDOUT`));
            const streamTo = staging.query(copyFrom(`COPY "${table}" (${colString}) FROM STDIN`));
            await pipeline(streamFrom, streamTo);
            console.log(`  -> ${table} synced successfully!`);
        }
        catch (err) {
            console.error(`  -> Failed syncing ${table}:`, err);
        }
        await staging.query(`ALTER TABLE "${table}" ENABLE TRIGGER ALL`);
    }
    await prod.end();
    await staging.end();
}
syncFailed().catch(console.error);
