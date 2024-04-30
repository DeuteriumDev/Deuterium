'use client';

import _ from 'lodash';
import { ChevronsRightLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import upsertPermission from '~/actions/upsertPermission';
import { Permission } from '~/libs/types';
import useQuery from '~/libs/useQuery';
import cn from '~/libs/className';
import Button from '~/components/Button';
import { ToggleGroup, ToggleGroupItem } from '~/components/ToggleGroup';
import deletePermission from '../actions/deletePermission';
import useUrl from '~/libs/useUrl';

interface PermissionFormProps {
  permission: Permission;
  upsertPermission: typeof upsertPermission;
  deletePermission: typeof deletePermission;
}

const FULL_PERMISSIONS = ['can_create', 'can_read', 'can_update', 'can_delete'];

export default function PermissionForm(props: PermissionFormProps) {
  const {
    permission: initPermission,
    upsertPermission,
    deletePermission,
  } = props;
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const url = useUrl();

  const mutate = useQuery((arg: unknown) =>
    upsertPermission({
      id: initPermission.id,
      document_id: initPermission.document_id,
      group_id: initPermission.group_id,
      can_create: (arg as Permission).can_create,
      can_read: (arg as Permission).can_read,
      can_update: (arg as Permission).can_update,
      can_delete: (arg as Permission).can_delete,
    }),
  );

  const _handleChange = async (permissions: string[]) => {
    try {
      const result = await mutate.execute({
        id: initPermission.id,
        ..._.fromPairs(
          _.zip(
            FULL_PERMISSIONS,
            _.map(FULL_PERMISSIONS, (p) => _.includes(permissions, p)),
          ),
        ),
      });

      if (result?.errorMessage) {
        throw new Error(result.errorMessage);
      }
      if (result?.data?.rowCount !== 1) {
        throw new Error('Upsert Error: no rows added');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const _handleDelete = async () => {
    try {
      const result = await deletePermission({ id: initPermission.id });
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }
      router.push(url.set('v', String(Date.now())));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const init = _.compact(
    _.map(_.pick(initPermission, FULL_PERMISSIONS), (_v: unknown, k: string) =>
      initPermission[k] ? k : null,
    ),
  ) as unknown as string[];

  return (
    <div className={cn('flex flex-col', error && 'text-error')}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row space-x-3 items-center">
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            onValueChange={_handleChange}
            defaultValue={init}
          >
            <ToggleGroupItem value={'can_create'}>c</ToggleGroupItem>
            <ToggleGroupItem value={'can_read'}>r</ToggleGroupItem>
            <ToggleGroupItem value={'can_update'}>u</ToggleGroupItem>
            <ToggleGroupItem value={'can_delete'}> d</ToggleGroupItem>
          </ToggleGroup>
          {initPermission.group_name && (
            <Link
              href={(() => {
                const val = new URLSearchParams(search);
                val.set('groups_id', initPermission.group_id);
                return `?${val.toString()}`;
              })()}
              className="underline"
            >
              {initPermission.group_name}
            </Link>
          )}
          <ChevronsRightLeft className="h-4 w-4 mx-2" />
          {initPermission.document_name && (
            <Link
              href={(() => {
                const val = new URLSearchParams(search);
                val.set('documents_id', initPermission.document_id);
                return `?${val.toString()}`;
              })()}
              className="underline"
            >
              {initPermission.document_name}
            </Link>
          )}
        </div>

        <Button className="h-7 rounded-md px-2 ml-auto" onClick={_handleDelete}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      {error && <div>{error}</div>}
    </div>
  );
}
