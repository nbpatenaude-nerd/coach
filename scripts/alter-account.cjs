const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres:KhgUgzIafipadINfmhFvCVQDDFvDOQqf@altaria.proxy.rlwy.net:52047/railway' });
client.connect().then(async () => {
  try {
    await client.query(`ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey"`);
    await client.query(`ALTER TABLE "Account" ADD COLUMN "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text`);
    await client.query(`ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id")`);
    await client.query(`CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`);
    console.log('SUCCESS');
  } catch(e) {
    console.error(e);
  }
  client.end();
});
