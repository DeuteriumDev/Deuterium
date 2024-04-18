'use server';

import _ from 'lodash';

import { PAGE_SIZE } from '~/config';
import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { User } from '~/libs/types';

interface QueryUsersArgs {
  where?: string;
  page?: number;
}

/**
 * Query list of users from db
 *
 * @param params - filter sql results by adding a when statement and paging
 * @param args - formatted query args, injection safe
 * @returns
 */
const queryUsers = async (
  { where, page }: QueryUsersArgs,
  args?: unknown[],
) => {
  const results = await buildQuery<User>(
    sql,
    `
        select
          id,
          email,
          created_at,
          groups_ids,
          groups_names
        from (
          select
            u.id,
            u.email,
            u.created_at,
            array_agg(g.id) as groups_ids,
            array_agg(g.name) as groups_names
          from ${process.env.PUBLIC_SCHEMA}.users u
          left join ${process.env.PUBLIC_SCHEMA}.group_members gm on gm.user_id = u.id
          join ${process.env.PUBLIC_SCHEMA}.groups g on g.id = gm.group_id
          group by u.id
          order by u.created_at
        )
        ${where ? `where ${where}` : ''}
  
        limit ${PAGE_SIZE}
        offset ${page || 0}        
      `,
    _.compact(args),
  );
  return results;
};

export default queryUsers;
