'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Document } from '~/libs/types';
import { PAGE_SIZE } from '~/config';

type QueryDocumentOrderArgs = {
  page: number;
  orderBy: string;
  orderDir: string;
};

type QueryDocumentWhereArgs = {
  where: string;
  page: number;
};

export type QueryDocumentArgs =
  | {
      page: number;
    }
  | QueryDocumentOrderArgs
  | QueryDocumentWhereArgs;

const queryDocuments = async (query: QueryDocumentArgs, params?: unknown[]) =>
  await buildQuery<Document>(
    sql,
    `
      select
        id,
        name as _name,
        '[' || name || '](/documents/' || id || ')' as name,
        type,
        created_at
      from ${process.env.PUBLIC_SCHEMA}.documents_view
      ${(query as QueryDocumentWhereArgs).where ? `where ${(query as QueryDocumentWhereArgs).where}` : ''}
      ${(query as QueryDocumentOrderArgs).orderBy && (query as QueryDocumentOrderArgs).orderBy ? `order by ${(query as QueryDocumentOrderArgs).orderBy} ${(query as QueryDocumentOrderArgs).orderDir}` : ''}
      limit ${PAGE_SIZE}
      offset ${query.page * PAGE_SIZE}
    `,
    params,
  );

export default queryDocuments;
