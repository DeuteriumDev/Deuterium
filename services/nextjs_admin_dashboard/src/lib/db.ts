import { Pool, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION || '',
});

/**
 * Thin wrapper around pg client to handle opening and closing connections
 */
async function sql<Row extends QueryResultRow>(
  query: string,
  values?: unknown[],
) {
  const client = await pool.connect();
  let data;
  let error;

  if (process.env.DEBUG) {
    /* eslint-disable no-console */
    console.log('---\t\tQUERY START\t\t---');
    console.log(query);
  }

  try {
    data = await client.query<Row>(query, values);
    console.log('---\t\tQUERY END\t\t---');
    console.log(`---\t\tresult count: ${data?.rowCount}\t\t---`);
  } catch (e) {
    error = e as Error;
  } finally {
    client.release();
  }

  if (error && error instanceof Error) {
    throw new Error(error.message);
  }
  /* eslint-enable no-console */

  return {
    rows: data?.rows || [],
    rowCount: data?.rowCount || 0,
  };
}

export default sql;
