'use server';

import _ from 'lodash';
import { Suspense } from 'react';

import DashboardCards, { DASHBOARD_CARDS } from '~/components/DashboardCards';
import { Skeleton } from '~/components/Skeleton';
import RecentActivityTable from '~/components/RecentActivityTable';

export default async function Dashboard() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {_.map(DASHBOARD_CARDS, (c) => (
              <Skeleton key={c.title} className={`w-44 h-24`} />
            ))}
          </div>
        }
      >
        <DashboardCards />
      </Suspense>
      <div className="pt-10">
        <RecentActivityTable />
      </div>
    </div>
  );
}
