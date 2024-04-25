import { redirect, notFound } from 'next/navigation';

import GroupsBreadCrumb from '~/components/GroupsBreadCrumb';
import GroupsForm from '~/components/GroupsForm';
import GroupsMembersList from '~/components/GroupsMembersList';
import queryGroup from '~/actions/queryGroup';
import queryGroupBreadcrumbs from '~/actions/queryGroupBreadcrumbs';
import upsertGroup from '~/actions/upsertGroup';

type GroupPageFormParams = {
  params: { id: string };
  searchParams: { page?: string };
};
type GroupPageNewParams = {
  params: { id: 'new' };
  searchParams: { parent_id: string };
};

type GroupPageProps = GroupPageFormParams | GroupPageNewParams;

export default async function GroupPage(props: GroupPageProps) {
  const {
    params: { id },
    searchParams: { page = 0 },
  } = props as GroupPageFormParams;

  if (id === 'new') {
    const result = await upsertGroup({
      name: 'new group',
      parent_id: (props as GroupPageNewParams).searchParams.parent_id,
    });
    redirect(`/groups/${result.data?.rows[0].id}`);
  }

  const queryGroupResult = await queryGroup({ id });

  if (queryGroupResult.data?.rowCount === 0) {
    notFound();
  }
  const queryGroupCrumbsResult = await queryGroupBreadcrumbs({ id });

  return (
    <div>
      <h2>Group</h2>
      {!queryGroupCrumbsResult.errorMessage && (
        <GroupsBreadCrumb
          groupsCrumbs={queryGroupCrumbsResult.data?.rows || []}
        />
      )}
      {queryGroupCrumbsResult.errorMessage && (
        <p className="text-error">{queryGroupCrumbsResult.errorMessage}</p>
      )}
      <div className="grid gap-8 grid-cols-2">
        {queryGroupResult.data?.rows[0] && (
          <>
            <GroupsForm group={queryGroupResult.data?.rows[0]} />
            <GroupsMembersList parent_id={id} page={Number(page)} />
          </>
        )}
      </div>
    </div>
  );
}
