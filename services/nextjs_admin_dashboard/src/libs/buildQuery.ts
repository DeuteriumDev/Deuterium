import { QueryResultRow } from 'pg';
import sql from './db';

export default async function buildQuery<T extends QueryResultRow>(
  client: typeof sql,
  query: string,
  args?: unknown[],
): Promise<
  | { data: { rows: T[]; rowCount: number }; errorMessage: string | null }
  | { data: null; errorMessage: string }
> {
  let data = {
    rows: [] as T[],
    rowCount: 0,
  };
  let errorMessage: string | null = null;

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
