'use server';

import _ from 'lodash';
import { revalidatePath } from 'next/cache';

import buildQuery from '~/libs/buildQuery';
import castValueToSQL from '~/libs/castValueToSQL';
import sql from '~/libs/db';
import { Group } from '~/libs/types';

interface UpsertGroupArgs {
  id?: string;
  name?: string;
  parent_id?: string | null;
}

/**
 * Insert / update group
 *
 * @param group - group to be created / updated
 * @returns
 */
async function upsertGroup(group: UpsertGroupArgs) {
  const keys = _.keys(group) as (keyof typeof group)[];
  const result = await buildQuery<Group>(
    sql,
    `
       insert into ${process.env.PUBLIC_SCHEMA}.groups (${keys.join(', ')}) values (${_.map(keys, (k, i) => castValueToSQL(group[k], `$${i + 1}`)).join(', ')})
       on conflict (id) do update set ${_.compact(
         _.map(keys, (k, i) => {
           if ((k as string) === 'id') return null;
           return `${k} = ${castValueToSQL(group[k], `$${i + 1}`)}`;
         }),
       ).join(', ')}
       returning *
      `,
    _.values(group),
  );

  _.forEach(
    [
      `/groups/${group.id}`,
      '/groups',
      group.parent_id && `/groups/${group.parent_id}`,
    ],
    (p) => p && revalidatePath(p),
  );
  return result;
}

export default upsertGroup;
