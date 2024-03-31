'use server';

import { Suspense } from 'react';

import NodeGrowthCards from '~/components/NodeGrowthCards';

import RecentActivityTable from '~/components/RecentActivityTable';
import NodeGrowthCardsSkeleton from '~/components/NodeGrowthCardsSkeleton';
import TableSkeleton from '~/components/TableSkeleton';

interface DashboardProps {
  searchParams: { page: string };
}
export default async function Dashboard(props: DashboardProps) {
  const {
    searchParams: { page = 0 },
  } = props;

  return (
    <div>
      <Suspense fallback={<NodeGrowthCardsSkeleton />}>
        <NodeGrowthCards />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <RecentActivityTable page={Number(page)} />
      </Suspense>
    </div>
  );
}
