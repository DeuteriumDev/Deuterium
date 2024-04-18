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

const queryGroups = async (args: QueryGroupArgs) => {
  const results = await buildQuery<Group>(
    sql,
    `
      select
        id,
        '[' || name || '](/groups/' || id || ')' as name,
        '[' || path_names[1] || '](/groups/' || path_ids[1] || ')' as parent_name,
        created_at
      from ${process.env.PUBLIC_SCHEMA}.groups_view
      ${(args as QueryGroupWhereArgs).where ? `where ${(args as QueryGroupWhereArgs).where}` : ''}
      ${(args as QueryGroupOrderArgs).orderBy && (args as QueryGroupOrderArgs).orderBy ? `order by ${(args as QueryGroupOrderArgs).orderBy} ${(args as QueryGroupOrderArgs).orderDir}` : ''}
      limit ${PAGE_SIZE}
      offset ${args.page * PAGE_SIZE}
    `,
  );

  return results;
};

export default queryGroups;
