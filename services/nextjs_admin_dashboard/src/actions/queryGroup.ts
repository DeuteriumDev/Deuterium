'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Group } from '~/libs/types';

interface QueryGroupArgs {
  id: string;
  page?: number;
}

/**
 * Get a single group by id
 *
 * @param param0 - match group id
 * @returns
 */
const queryGroup = async ({ id }: QueryGroupArgs) =>
  buildQuery<Group & { parent_id: string; parent_name: string }>(
    sql,
    `
      select 
        id,
        name,
        created_at,
        path_names,
        path_ids,
        path_names[1] parent_name,
        path_ids[1] parent_id
      from ${process.env.PUBLIC_SCHEMA}.groups_view
      where id = $1::uuid
      limit 1
    `,
    [id],
  );

export default queryGroup;
