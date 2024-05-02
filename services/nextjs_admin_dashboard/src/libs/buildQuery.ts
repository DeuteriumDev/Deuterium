import { QueryResultRow } from 'pg';
import sql from './db';

export default async function buildQuery<T extends QueryResultRow>(
  client: typeof sql,
  query: string,
  args?: unknown[],
) {
  let data = {
    rows: [] as T[],
    rowCount: 0,
  };
  let errorMessage;

  try {
    data = await client<T>(query, args);
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  }

  return {
    data,
    errorMessage,
  };
}
