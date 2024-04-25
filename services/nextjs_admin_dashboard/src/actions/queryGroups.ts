'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Group } from '~/libs/types';
import { PAGE_SIZE } from '~/config';

type QueryGroupOrderArgs = {
  page: number;
  orderBy: string;
  orderDir: string;
};

type QueryGroupWhereArgs = {
  where: string;
  page: number;
};

export type QueryGroupArgs =
  | {
      page: number;
    }
  | QueryGroupOrderArgs
  | QueryGroupWhereArgs;

const queryGroups = async (query: QueryGroupArgs, params?: unknown[]) =>
  await buildQuery<Group>(
    sql,
    `
      select
        id,
        name as _name,
        '[' || name || '](/groups/' || id || ')' as name,
        path_names[1] as _parent_name,
        '[' || path_names[1] || '](/groups/' || path_ids[1] || ')' as parent_name,
        created_at
      from ${process.env.PUBLIC_SCHEMA}.groups_view
      ${(query as QueryGroupWhereArgs).where ? `where ${(query as QueryGroupWhereArgs).where}` : ''}
      ${(query as QueryGroupOrderArgs).orderBy && (query as QueryGroupOrderArgs).orderBy ? `order by ${(query as QueryGroupOrderArgs).orderBy} ${(query as QueryGroupOrderArgs).orderDir}` : ''}
      limit ${PAGE_SIZE}
      offset ${query.page * PAGE_SIZE}
    `,
    params,
  );

export default queryGroups;
