'use server';
import _ from 'lodash';

import queryPermissions from '~/actions/queryPermissions';
import { Card, CardDescription, CardHeader } from '~/components/Card';
import PermissionForm from '~/components/PermissionForm';
import { Permission } from '~/libs/types';
import GroupsListRouter from '~/components/GroupsListRouter';
import DocumentsListRouter from '~/components/DocumentsListRouter';
import PermissionNewButton from '~/components/PermissionNewButton';
import upsertPermission from '~/actions/upsertPermission';
import deletePermission from '~/actions/deletePermission';
import queryGroups from '~/actions/queryGroups';
import queryDocuments from '~/actions/queryDocuments';

interface GroupPageProps {
  searchParams: {
    groups_id?: string;
    documents_id?: string;
    permissions_page?: string;
  };
}

export default async function PermissionsPage(props: GroupPageProps) {
  const {
    searchParams: { groups_id, documents_id },
  } = props;

  let permissionsQuery;
  let permissions: Permission[] = [];
  if (documents_id && !groups_id) {
    permissionsQuery = await queryPermissions(
      { page: 0, where: `document_id = $1` },
      [documents_id],
    );
    permissions = permissionsQuery.data?.rows || [];
  } else if (!documents_id && groups_id) {
    const permissionsQuery = await queryPermissions(
      { page: 0, where: `group_id = $1` },
      [groups_id],
    );
    permissions = permissionsQuery.data?.rows || [];
  } else if (documents_id && groups_id) {
    const permissionsQuery = await queryPermissions(
      { page: 0, where: `group_id = $1 and document_id = $2` },
      [groups_id, documents_id],
    );
    permissions = permissionsQuery.data?.rows || [];
  } else {
    permissions = [];
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-8 py-8">
        <GroupsListRouter pathRoot="/permissions" queryGroups={queryGroups} />
        <DocumentsListRouter
          pathRoot="/permissions"
          queryDocuments={queryDocuments}
        />
      </div>
      {!_.isEmpty(permissions) && (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              {_.map(permissions, (p) => (
                <PermissionForm
                  key={p.id}
                  permission={p}
                  upsertPermission={upsertPermission}
                  deletePermission={deletePermission}
                />
              ))}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {!documents_id && !groups_id && (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Select a group and / or document to view it&apos;s permissions
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {documents_id && groups_id && _.isEmpty(permissions) && (
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              <PermissionNewButton
                upsertPermission={upsertPermission}
                groups_id={groups_id}
                documents_id={documents_id}
              />
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
