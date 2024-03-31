'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Input from '~/components/Input';
import Button from '~/components/Button';
import { useRouter, useSearchParams } from 'next/navigation';

interface NodesFilterFormProps {
  query: Record<string, string | string[] | number> & { where: string };
}

export default function NodesFilterForm(props: NodesFilterFormProps) {
  const { query } = props;
  const [where, setWhere] = useState<string>(query.where);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    setWhere(query.where);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(query)]);

  return (
    <div className="flex">
      <Input
        placeholder="where..."
        id="where"
        className="max-w-sm"
        onChange={(e) => {
          setWhere(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            router.replace(
              `?${params
                .toString()
                .split('&')
                .filter((p) => !p.startsWith('where'))
                .join('&')}&where=${where}`,
            );
          }
        }}
        value={where}
      />
      <Button disabled={!where} asChild={Boolean(where)} className="ml-2 py-1">
        <Link href={{ query: where ? { ...query, where } : query }}>
          Filter
        </Link>
      </Button>
    </div>
  );
}
