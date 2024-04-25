'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { PAGE_SIZE } from '~/config';

interface QueryGroupChildrenArgs {
  parent_id: string;
  page?: number;
  where?: string;
}

export interface UserOrGroup {
  id: string;
  name: string;
  created_at: Date;
  type: 'user' | 'group';
}

/**
 * Get users and sub-groups of given group [id]
 *
 * @param param0 Filter results according to id (parent_id) a where statement and page
 * @returns
 */
const queryGroupChildren = async (
  { parent_id, page, where }: QueryGroupChildrenArgs,
  params?: unknown[],
) =>
  buildQuery<UserOrGroup>(
    sql,
    `
      select
          id,
          name,
          created_at,
          type
      from ${process.env.PUBLIC_SCHEMA}.recent_nodes_view
      where parent_id = '${parent_id}' and (type = 'group' or type = 'user') ${where ? `and ${where}` : ''}
      limit ${PAGE_SIZE}
      offset ${page || 0}
    `,
    params,
  );

export default queryGroupChildren;
