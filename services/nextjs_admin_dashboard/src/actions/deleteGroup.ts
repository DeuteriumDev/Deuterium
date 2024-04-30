'use server';

import _ from 'lodash';
import { revalidatePath } from 'next/cache';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Group } from '~/libs/types';
import { Result } from '~/libs/useQuery';

/**
 *
 * @param param0 - group [id] to delete on
 * @param revalidatePaths - optionally clear caches of provided paths
 * @returns
 */
const deleteGroup = async ({ id }: { id: string }) => {
  const result2 = await buildQuery<Group>(
    sql,
    `
      delete from ${process.env.PUBLIC_SCHEMA}.group_members where group_id = $1 returning * 
    `,
    [id],
  );
  const result1 = await buildQuery<Group>(
    sql,
    `
      delete from ${process.env.PUBLIC_SCHEMA}.groups where id = $1 returning *
    `,
    [id],
  );

  _.forEach(
    _.concat(
      _.map(result2.data?.rows, (r) => `/users/${r.user_id}`),
      '/users',
      '/groups',
      `/groups/${id}`,
    ),
    (p) => revalidatePath(p),
  );

  return {
    data: {
      rows: [...(result1.data?.rows || []), result2.data?.rows],
      rowCount: (result1.data?.rowCount || 0) + (result1.data?.rowCount || 0),
    },
    errorMessage: result1.errorMessage || result2.errorMessage,
  } as unknown as Result<Group>;
};

export default deleteGroup;
