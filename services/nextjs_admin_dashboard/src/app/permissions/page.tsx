import _ from 'lodash';
import { Suspense } from 'react';
import PermissionsTable from '~/components/PermissionsTable';
import TableSkeleton from '~/components/TableSkeleton';

interface PermissionsPageProps {
  searchParams: {
    page: string;
    hiddenColumns: string[];
    orderBy: string;
    orderDir: string;
    where: string;
  };
}
export default function Permissions(props: PermissionsPageProps) {
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
      <h2 className="ml-1 text-2xl font-bold tracking-tight">Permissions</h2>
      <Suspense fallback={<TableSkeleton />}>
        <PermissionsTable
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
