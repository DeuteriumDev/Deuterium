'use server';

import _ from 'lodash';
import { revalidatePath } from 'next/cache';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { User } from '~/libs/types';

interface RemoveUsersFromGroupArgs {
  users: User[];
  groupId: string;
}
/**
 * Add given users to the provided group
 *
 * @param param0 - users and groupId to add to
 * @param revalidatePaths - clear caching along provided paths
 * @returns
 */
const removeUsersFromGroup = async ({
  users,
  groupId,
}: RemoveUsersFromGroupArgs) => {
  const results = await buildQuery(
    sql,
    `
      delete from ${process.env.PUBLIC_SCHEMA}.group_members where user_id = any(${_.map(users, (_u, i) => `($${i + 2})`).join(', ')}) and group_id = $1
    `,
    [groupId, _.map(users, (u) => u.id)],
  );

  _.forEach(
    _.concat(
      _.map(users, (u) => `/users/${u.id}`),
      `/groups/${groupId}`,
      '/users',
      '/groups',
    ),
    (p) => p && revalidatePath(p),
  );
  return results;
};

export default removeUsersFromGroup;
