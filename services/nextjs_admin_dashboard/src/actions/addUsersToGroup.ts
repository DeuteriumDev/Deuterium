'use server';

import _ from 'lodash';
import { revalidatePath } from 'next/cache';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { User } from '~/libs/types';

interface AddUsersToGroupArgs {
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
const addUsersToGroup = async (
  { users, groupId }: AddUsersToGroupArgs,
  revalidatePaths?: string[],
) => {
  const results = await buildQuery(
    sql,
    `
        insert into ${process.env.PUBLIC_SCHEMA}.group_members (user_id, group_id) values ${_.map(users, (_u, i) => `($${i + 1}, $${i + 2}::uuid)`).join(', ')}
      `,
    _.flatMap(users, (u) => [u.id, groupId]),
  );
  if (revalidatePaths) {
    _.map(revalidatePaths, revalidatePath);
  }
  return results;
};

export default addUsersToGroup;
