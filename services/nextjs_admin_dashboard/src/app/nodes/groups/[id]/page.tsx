import { Suspense } from 'react';

import GroupsBreadCrumb from '~/components/GroupsBreadCrumb';
import GroupsForm from '~/components/GroupsForm';
import GroupsMembersList from '~/components/GroupsMembersList';

import { queryGroup, queryGroupChildren, updateGroup } from './actions';
import FormSkeleton from '~/components/FormSkeleton';

interface GroupPageProps {
  params: {
    id: string;
  };
}

export default async function GroupPage(props: GroupPageProps) {
  const {
    params: { id },
  } = props;

  const queryGroupResult = await queryGroup({ id });
  const queryGroupChildrenResult = await queryGroupChildren({ id });

  return (
    <div>
      <h2>Group</h2>
      <GroupsBreadCrumb id={id} />
      <div className="grid gap-8 grid-cols-2">
        <Suspense fallback={<FormSkeleton />}>
          <GroupsForm
            group={queryGroupResult.data.rows[0]}
            groupParents={queryGroupChildrenResult.data.rows}
            submit={updateGroup}
          />
        </Suspense>
        <GroupsMembersList parent_id={id} />
      </div>
    </div>
  );
}
