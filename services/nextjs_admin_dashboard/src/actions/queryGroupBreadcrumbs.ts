'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Group } from '~/libs/types';

interface QueryGroupArgs {
  id: string;
}

/**
 * Get breadcrumbs array given a group [id]. It won't include given group in breadcrumb.
 *
 * @param param0 - id of group
 * @returns
 */
const queryGroupBreadcrumbs = async ({ id }: QueryGroupArgs) =>
  buildQuery<Group>(
    sql,
    `
      with recursive groups_with_path(id, name, parent_id, created_at, index) as (
          select
              id,
              name,
              parent_id,
              created_at,
              0 as index
          from ${process.env.PUBLIC_SCHEMA}.groups
          where id = '${id}'
          union
          select
              g.id,
              g.name,
              g.parent_id,
              g.created_at,
              gp.index + 1 as index
          from ${process.env.PUBLIC_SCHEMA}.groups g
          join groups_with_path gp on gp.parent_id = g.id
      )
      select
          id,
          name,
          parent_id,
          created_at
      from groups_with_path
      order by index desc
    `,
  );

export default queryGroupBreadcrumbs;
