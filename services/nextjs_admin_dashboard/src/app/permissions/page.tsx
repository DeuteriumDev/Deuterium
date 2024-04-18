import _ from 'lodash';
import queryPermissions from '~/actions/queryPermissions';
import DataTable from '~/components/DataTable';
import { PAGE_SIZE } from '~/config';

interface PermissionsPageProps {
  searchParams: {
    page: string;
    hiddenColumns: string[];
    orderBy: string;
    orderDir: string;
    where: string;
  };
}

const columns = ['group_name', 'crud', 'created_at', 'document_name'];
export default async function Permissions(props: PermissionsPageProps) {
  const {
    searchParams: {
      page = 0,
      hiddenColumns = [],
      orderBy = '',
      orderDir = '',
      where = '',
    },
  } = props;

  const permissions = await queryPermissions({
    page: Number(page),
    orderBy,
    orderDir,
    where,
  });

  return (
    <div>
      <h2 className="ml-1 text-2xl font-bold tracking-tight">Permissions</h2>
      <DataTable
        page={Number(page)}
        hiddenColumns={_.castArray(hiddenColumns)}
        orderBy={orderBy}
        orderDir={orderDir}
        where={where}
        columns={columns}
        pageSize={PAGE_SIZE}
        rows={permissions.data?.rows}
        errorMessage={permissions.errorMessage}
      />
    </div>
  );
}
