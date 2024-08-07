import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';

export type NodeType = 'user' | 'group' | 'permission' | 'document';

interface NodeGrowthResult {
  type: NodeType;
  total: number;
  count_this_month: number;
}

const queryNodesGrowths = async () =>
  buildQuery<NodeGrowthResult>(
    sql,
    `
        select 
          type,
          total,
          count_this_month
        from public.node_growth_view
    `,
  );

export default queryNodesGrowths;
