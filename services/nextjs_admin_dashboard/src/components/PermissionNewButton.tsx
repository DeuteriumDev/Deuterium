'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import upsertPermission from '~/actions/upsertPermission';
import Button from '~/components/Button';
import cn from '~/libs/className';
import useUrl from '~/libs/useUrl';

interface PermissionNewButtonProps {
  groups_id: string;
  documents_id: string;
  upsertPermission: typeof upsertPermission;
}
export default function PermissionNewButton(props: PermissionNewButtonProps) {
  const { documents_id, groups_id, upsertPermission } = props;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const url = useUrl();
  const _handleNew = async () => {
    if (groups_id && groups_id) {
      try {
        const result = await upsertPermission({
          group_id: groups_id,
          document_id: documents_id,
        });
        if (result.data?.rowCount === 0) {
          throw new Error('Nor rows added');
        }
        if (result.errorMessage) {
          throw new Error(result.errorMessage);
        }
        router.push(url.set('v', String(Date.now())));
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    }
  };

  return (
    <Button onClick={_handleNew} className={cn(errorMessage && 'text-error')}>
      {errorMessage || 'New permission'}
    </Button>
  );
}
