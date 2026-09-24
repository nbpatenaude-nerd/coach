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
    const tablesToFix = ['Goal', 'Account'];
    for (const table of tablesToFix) {
        const getCols = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`;
        const prodColsRes = (await prod.query(getCols, [table])).rows;
        const stagingColsRes = (await staging.query(getCols, [table])).rows;
        const stagingCols = stagingColsRes.map(r => r.column_name);
        // Intersect columns
        const commonCols = prodColsRes.filter(c => stagingCols.includes(c.column_name));
        // Map columns to handle enum changes
        const selectCols = commonCols.map(c => {
            if (c.column_name === 'subscriptionTier') {
                return `CASE WHEN "${c.column_name}"::text NOT IN ('FREE', 'SUPPORTER', 'PRO') THEN 'PRO' ELSE "${c.column_name}"::text END as "${c.column_name}"`;
            }
            return `"${c.column_name}"`;
        }).join(', ');
        const colString = commonCols.map(c => `"${c.column_name}"`).join(', ');
        await staging.query(`ALTER TABLE "${table}" DISABLE TRIGGER ALL`);
        await staging.query(`TRUNCATE TABLE "${table}" CASCADE`);
        try {
            const streamFrom = prod.query(copyTo(`COPY (SELECT ${selectCols} FROM "${table}") TO STDOUT`));
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
