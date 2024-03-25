'use server';

import { Suspense } from 'react';

import NodeGrowthCards from '~/components/NodeGrowthCards';

import RecentActivityTable from '~/components/RecentActivityTable';
import NodeGrowthCardsSkeleton from '~/components/NodeGrowthCardsSkeleton';
import RecentActivityTableSkeleton from '~/components/RecentActivityTableSkeleton';

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
      <Suspense fallback={<RecentActivityTableSkeleton />}>
        <RecentActivityTable page={Number(page)} />
      </Suspense>
    </div>
  );
}
