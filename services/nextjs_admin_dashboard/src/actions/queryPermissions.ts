'use server';

import { PAGE_SIZE } from '~/config';
import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Permission } from '~/libs/types';

type QueryGroupOrderArgs = {
  page: number;
  orderBy: string;
  orderDir: string;
};

type QueryGroupWhereArgs = {
  where: string;
  page: number;
};

type QueryGroupArgs =
  | {
      page: number;
    }
  | QueryGroupOrderArgs
  | QueryGroupWhereArgs;

const queryPermissions = async (args: QueryGroupArgs, params?: unknown[]) =>
  buildQuery<Permission>(
    sql,
    `
        select
          id,
          can_create,
          can_read,
          can_update,
          can_delete,
          created_at,
          group_name,
          group_id,
          document_type,
          document_name,
          foreign_id,
          document_id
        from ${process.env.PUBLIC_SCHEMA}.document_permissions_view
        ${(args as QueryGroupWhereArgs).where ? `where ${(args as QueryGroupWhereArgs).where}` : ''}
        ${(args as QueryGroupOrderArgs).orderBy && (args as QueryGroupOrderArgs).orderBy ? `order by ${(args as QueryGroupOrderArgs).orderBy} ${(args as QueryGroupOrderArgs).orderDir}` : ''}
        limit ${PAGE_SIZE}
        offset ${(args as QueryGroupArgs).page * PAGE_SIZE}
      `,
    params,
  );

export default queryPermissions;
