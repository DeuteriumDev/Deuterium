'use server';

import buildQuery from '~/lib/buildQuery';
import sql from '~/lib/db';
import { Group } from '~/lib/types';

export async function updateGroup(formData: FormData) {
  console.log({ ff: formData.keys() });
}

interface QueryGroupArgs {
  id: string;
}

export const queryGroup = async ({ id }: QueryGroupArgs) =>
  buildQuery<Group>(
    sql,
    `
      select *
      from groups_view
      where id = '${id}'
    `,
  );

export const queryGroupChildren = async ({ id }: QueryGroupArgs) =>
  buildQuery<Group>(
    sql,
    `
      select *
      from groups_view
      where not ('${id}' = any (path_ids))
    `,
  );
