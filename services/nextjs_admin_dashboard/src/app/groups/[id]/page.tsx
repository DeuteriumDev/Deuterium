import { redirect, notFound } from 'next/navigation';

import GroupsBreadCrumb from '~/components/GroupsBreadCrumb';
import GroupsForm from '~/components/GroupsForm';
import GroupsMembersList from '~/components/GroupsMembersList';
import queryGroup from '~/actions/queryGroup';
import queryGroupBreadcrumbs from '~/actions/queryGroupBreadcrumbs';
import upsertGroup from '~/actions/upsertGroup';

interface GroupPageProps {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
    parent_id?: string;
  };
}

export default async function GroupPage(props: GroupPageProps) {
  const {
    params: { id },
    searchParams: { page, parent_id },
  } = props;

  if (id === 'new') {
    const result = await upsertGroup({ name: 'new group', parent_id });
    redirect(`/groups/${result.data.rows[0].id}`);
  }

  const queryGroupResult = await queryGroup({ id });

  if (queryGroupResult.data.rowCount === 0) {
    notFound();
  }
  const queryGroupCrumbsResult = await queryGroupBreadcrumbs({ id });

  return (
    <div>
      <h2>Group</h2>
      {!queryGroupCrumbsResult.errorMessage && (
        <GroupsBreadCrumb groupsCrumbs={queryGroupCrumbsResult.data.rows} />
      )}
      {queryGroupCrumbsResult.errorMessage && (
        <p className="text-error">{queryGroupCrumbsResult.errorMessage}</p>
      )}
      <div className="grid gap-8 grid-cols-2">
        <GroupsForm group={queryGroupResult.data.rows[0] || { id: 'new' }} />
        {id !== 'new' && (
          <GroupsMembersList parent_id={id} page={Number(page)} />
        )}
      </div>
    </div>
  );
}
