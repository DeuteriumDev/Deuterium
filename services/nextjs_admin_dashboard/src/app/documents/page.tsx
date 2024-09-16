import _ from 'lodash';
import queryDocuments from '~/actions/queryDocuments';
import RouterTable from '~/components/RouterTable';
import { PAGE_SIZE } from '~/config';

interface DocumentPageProps {
  searchParams: {
    page: string;
    hiddenColumns: string[];
    orderBy: string;
    orderDir: string;
    where: string;
  };
}

const columns = ['name', 'type', 'created_at'];

export default async function Documents(props: DocumentPageProps) {
  const {
    searchParams: {
      page = 0,
      hiddenColumns = [],
      orderBy = '',
      orderDir = '',
      where = '',
    },
  } = props;

  const queryDocResults = await queryDocuments({
    page: Number(page),
    orderBy,
    orderDir,
    where,
  });
  return (
    <div>
      <h2 className="ml-1 text-2xl font-bold tracking-tight">Documents</h2>
      <RouterTable
        page={Number(page)}
        hiddenColumns={_.castArray(hiddenColumns)}
        orderBy={orderBy}
        orderDir={orderDir}
        where={where}
        columns={columns}
        pageSize={PAGE_SIZE}
        rows={queryDocResults.data?.rows || []}
        errorMessage={queryDocResults.errorMessage}
      />
    </div>
  );
}
