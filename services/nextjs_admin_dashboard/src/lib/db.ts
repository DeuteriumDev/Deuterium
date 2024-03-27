import { Pool, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION || '',
});

/**
 * Thin wrapper around pg client to handle opening and closing connections
 */
async function sql<Row extends QueryResultRow>(query: string, values?: any[]) {
  const client = await pool.connect();
  let data;
  let error;

  try {
    data = await client.query<Row>(query, values);
  } catch (e) {
    error = e as Error;
  } finally {
    client.release();
  }

  if (error) {
    throw error;
  }

  return {
    rows: data?.rows || [],
    rowCount: data?.rowCount || 0,
  };
}

export default sql;
