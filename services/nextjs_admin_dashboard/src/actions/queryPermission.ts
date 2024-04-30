'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Permission } from '~/libs/types';

const queryPermission = async (args: { id: string }) =>
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
      where id = $1
      limit 1
    `,
    [args.id],
  );

export default queryPermission;
