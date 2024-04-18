import { redirect, notFound } from 'next/navigation';

import queryPermission from '~/actions/queryPermission';
import upsertPermission from '~/actions/upsertPermission';

interface GroupPageProps {
  params: {
    id: string;
  };
  searchParams: {
    group_id?: string;
    document_id?: string;
  };
}

export default async function PermissionsPage(props: GroupPageProps) {
  const {
    params: { id },
    searchParams: { group_id, document_id },
  } = props;

  if (id === 'new' && group_id && document_id) {
    const result = await upsertPermission({
      group_id,
      document_id,
    });
    redirect(`/groups/${result.data.rows[0].id}`);
  }

  if (id === 'new' && (!group_id || !document_id)) {
    notFound();
  }

  const permission = await queryPermission({ id });
  if (permission.data.rowCount === 0) {
    notFound();
  }

  return <div>permission</div>;
}
