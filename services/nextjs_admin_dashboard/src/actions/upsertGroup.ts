'use server';

import _ from 'lodash';
import { revalidatePath } from 'next/cache';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Group } from '~/libs/types';

/**
 * Cast provided value to correct type for query
 *
 * @param value - whatever query value
 * @param key - optional key to use as name-string for query, usually param "$index"
 * @returns
 */
function castValueToSQL(value: unknown, key?: string): string | null {
  if (_.isNil(value)) {
    return key ? (key as string) : (value as null);
  }

  if (
    _.isString(value) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    if (key) {
      return `${key}::uuid`;
    }
    return `${value}::uuid`;
  }

  if (key) {
    return key;
  }
  return _.toString(value);
}

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
async function upsertGroup(group: UpsertGroupArgs, revalidatePaths?: string[]) {
  console.log(group);

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
  if (revalidatePaths) {
    _.map(revalidatePaths, revalidatePath);
  }
  return result;
}

export default upsertGroup;
