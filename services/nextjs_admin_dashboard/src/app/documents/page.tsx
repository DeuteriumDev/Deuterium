import _ from 'lodash';
import { Suspense } from 'react';
import DocumentsTable from '~/components/DocumentsTable';
import TableSkeleton from '~/components/TableSkeleton';

interface DocumentPageProps {
  searchParams: {
    page: string;
    hiddenColumns: string[];
    orderBy: string;
    orderDir: string;
    where: string;
  };
}
export default function Documents(props: DocumentPageProps) {
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
      <h2 className="ml-1 text-2xl font-bold tracking-tight">Documents</h2>
      <Suspense fallback={<TableSkeleton />}>
        <DocumentsTable
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
