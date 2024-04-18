import _ from 'lodash';
import DataTable from '~/components/DataTable';
import queryGroups from '~/actions/queryGroups';
import { PAGE_SIZE } from '~/config';

interface GroupPageProps {
  searchParams: {
    page: string;
    hiddenColumns: string[];
    orderBy: string;
    orderDir: string;
    where: string;
  };
}

const columns = ['name', 'parent_name', 'created_at'];

export default async function GroupsPage(props: GroupPageProps) {
  const {
    searchParams: {
      page = 0,
      hiddenColumns = [],
      orderBy = '',
      orderDir = '',
      where = '',
    },
  } = props;

  const queryGroupsResult = await queryGroups({
    page: Number(page),
    orderBy,
    orderDir,
    where,
  });

  return (
    <div>
      <h2 className="ml-1 text-2xl font-bold tracking-tight">Groups</h2>
      <DataTable
        page={Number(page)}
        hiddenColumns={_.castArray(hiddenColumns)}
        orderBy={orderBy}
        orderDir={orderDir}
        where={where}
        columns={columns}
        pageSize={PAGE_SIZE}
        rows={queryGroupsResult.data?.rows}
        errorMessage={queryGroupsResult.errorMessage}
      />
    </div>
  );
}
