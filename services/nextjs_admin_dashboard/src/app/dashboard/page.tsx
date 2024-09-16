'use server';

import { Suspense } from 'react';

import NodesGrowthCards from '~/components/NodesGrowthCards';
import NodesRecentActivityTable from '~/components/NodesRecentActivityTable';
import NodesGrowthCardsSkeleton from '~/components/NodesGrowthCardsSkeleton';
import TableSkeleton from '~/components/TableSkeleton';
import queryNodesGrowths from '~/actions/queryNodeGrowths';
import queryRecentNodes from '~/actions/queryRecentNodes';

interface DashboardProps {
  searchParams: { page: string };
}

export default async function Dashboard(props: DashboardProps) {
  const {
    searchParams: { page = 0 },
  } = props;

  return (
    <div>
      <Suspense fallback={<NodesGrowthCardsSkeleton />}>
        <NodesGrowthCards queryNodesGrowths={queryNodesGrowths} />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <NodesRecentActivityTable
          page={Number(page)}
          queryRecentNodes={queryRecentNodes}
        />
      </Suspense>
    </div>
  );
}
