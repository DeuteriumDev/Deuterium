import React from 'react';
import Skeleton from '~/components/Skeleton';

export default function RecentActivityTableSkeleton() {
  return (
    <div className="pt-10">
      <div className="flex flex-col">
        <h2 className="ml-1 text-2xl font-bold tracking-tight">Groups</h2>
        <Skeleton className="w-24 h-10" />
        <div className="grid grid-cols-1 gap-4">
          {Array(5)
            .fill(null)
            .map((_v, i) => (
              <Skeleton className="w-full h-10" key={`table-skeleton-${i}`} />
            ))}
        </div>
        <div className="flex flex-row justify-end pt-5">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24 ml-2" />
        </div>
      </div>
    </div>
  );
}
