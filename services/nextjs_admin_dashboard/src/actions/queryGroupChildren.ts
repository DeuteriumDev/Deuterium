'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Group } from '~/libs/types';

import { PAGE_SIZE } from '~/config';

interface QueryGroupChildrenArgs {
  id: string;
  page?: number;
  where?: string;
}

/**
 * Get users and sub-groups of given group [id]
 *
 * @param param0 Filter results according to id (parent_id) a where statement and page
 * @returns
 */
const queryGroupChildren = async ({
  id,
  page,
  where,
}: QueryGroupChildrenArgs) =>
  buildQuery<Group>(
    sql,
    `
      select *
      from ${process.env.PUBLIC_SCHEMA}.groups_view
      where not ('${id}' = any (path_ids)) and id != '${id}' ${where ? `and ${where}` : ''}
      limit ${PAGE_SIZE}
      ${page ? `offset ${page * PAGE_SIZE}` : ''}
    `,
  );

export default queryGroupChildren;
