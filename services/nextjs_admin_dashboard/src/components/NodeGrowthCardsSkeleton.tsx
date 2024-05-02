import _ from 'lodash';
import React from 'react';
import Skeleton from '~/components/Skeleton';

export default function NodeGrowthCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {_.map(Array(4).fill(null), (_a, i) => (
        <Skeleton
          key={`NodeGrowthCardsSkeleton-${i}`}
          className={`w-44 h-24`}
        />
      ))}
    </div>
  );
}
