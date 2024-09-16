'use server';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
import { Node } from '~/libs/types';
import { PAGE_SIZE } from '~/config';

const queryRecentNodes = async ({ page }: { page: number }) =>
  buildQuery<Node>(
    sql,
    `
  select 
    id,
    '[' || name || '](/' || type || 's/' || id || ')' as name,
    type,
    created_at
  from ${process.env.PUBLIC_SCHEMA}.recent_nodes_view
  limit ${PAGE_SIZE}
  offset ${page * PAGE_SIZE}
  `,
  );

export default queryRecentNodes;
