import pg from 'pg'
const pool = new pg.Pool({ connectionString: 'postgresql://watts:password@localhost:5432/watts' })
pool
  .query('SELECT * FROM "CoachingRelationship"')
  .then((res) => console.log(res.rows))
  .catch(console.error)
  .finally(() => pool.end())
