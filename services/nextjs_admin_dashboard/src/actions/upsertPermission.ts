import _ from 'lodash';
import { revalidatePath } from 'next/cache';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import castValueToSQL from '~/libs/castValueToSQL';
import { Permission } from '~/libs/types';

interface UpsertPermissionArgs {
  id?: string;
  group_id: string;
  document_id: string;
  can_create?: boolean;
  can_read?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
}

/**
 * Insert of update a given permission. CRUDs default to all true;
 *
 * @param args permissions object to create
 * @returns
 */
async function upsertPermission(args: UpsertPermissionArgs) {
  const keys = _.keys(args) as (keyof UpsertPermissionArgs)[];
  const results = await buildQuery<Permission>(
    sql,
    `
       insert into ${process.env.PUBLIC_SCHEMA}.document_permissions (${keys.join(', ')}) values (${_.map(keys, (k, i) => castValueToSQL(args[k], `$${i + 1}`)).join(', ')})
       on conflict (id) do update set ${_.compact(
         _.map(keys, (k, i) => {
           if ((k as string) === 'id') return null;
           return `${k} = ${castValueToSQL(args[k], `$${i + 1}`)}`;
         }),
       ).join(', ')}
       returning *
      `,
    _.values(args),
  );

  _.forEach(['/permissions', `/groups/${args.group_id}`], (p) =>
    revalidatePath(p),
  );

  return results;
}

export default upsertPermission;
