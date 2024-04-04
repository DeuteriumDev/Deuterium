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
    console.log('---\t\tQuery:\t\t---');
    console.log(query);
  }

  try {
    const start = performance.now();
    data = await client.query<Row>(query, values);

    console.log(`---\t\tQuery count: ${data?.rowCount}\t\t---`);
    console.log(
      `---\t\tQuery duration: ${((performance.now() - start) as number).toFixed(2)} ms\t\t---`,
    );
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
