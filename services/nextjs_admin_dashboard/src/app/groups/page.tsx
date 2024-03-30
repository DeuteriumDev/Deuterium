import _ from 'lodash';
import { Suspense } from 'react';
import GroupsTable from '~/components/GroupsTable';
import GroupsTableSkeleton from '~/components/GroupsTableSkeleton';

interface GroupPageProps {
  searchParams: {
    page: string;
    hiddenColumns: string[];
    orderBy: string;
    orderDir: string;
    where: string;
  };
}
export default function Groups(props: GroupPageProps) {
  const {
    searchParams: {
      page = 0,
      hiddenColumns = [],
      orderBy = '',
      orderDir = '',
      where = '',
    },
  } = props;
  return (
    <div>
      <h2 className="ml-1 text-2xl font-bold tracking-tight">Groups</h2>
      <Suspense fallback={<GroupsTableSkeleton />}>
        <GroupsTable
          page={Number(page)}
          hiddenColumns={_.castArray(hiddenColumns)}
          orderBy={orderBy}
          orderDir={orderDir}
          where={where}
        />
      </Suspense>
    </div>
  );
}
