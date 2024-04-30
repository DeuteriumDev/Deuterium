'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Permission } from '~/libs/types';

/**
 *
 * @param param0 - permission [id] to delete on
 * @returns
 */
const deletePermission = async ({ id }: { id: string }) => {
  const result = await buildQuery<Permission>(
    sql,
    `
      delete from ${process.env.PUBLIC_SCHEMA}.document_permissions where id = $1 returning *
    `,
    [id],
  );

  return result;
};

export default deletePermission;
