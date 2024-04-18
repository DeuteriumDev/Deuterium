import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Permission } from '~/libs/types';

const queryPermissions = async (args: { id: string }) =>
  buildQuery<Permission>(
    sql,
    `
        select
          *
        from ${process.env.PUBLIC_SCHEMA}.document_permissions_view
        where id = $1
        limit 1
      `,
    [args.id],
  );

export default queryPermissions;
