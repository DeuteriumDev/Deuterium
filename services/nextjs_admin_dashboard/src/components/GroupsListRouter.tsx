'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { CheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PAGE_SIZE } from '~/config';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '~/components/Card';
import Button from '~/components/Button';
import useQuery from '~/libs/useQuery';
import queryGroups from '~/actions/queryGroups';
import cn from '~/libs/className';
import Input from '~/components/Input';
import useUrl from '~/libs/useUrl';

const PAGE_PARAM = 'groups_page';
const ID_PARAM = 'groups_id';

interface GroupsListRouterProps {
  pathRoot: string;
  queryGroups: typeof queryGroups;
}

export default function GroupsListRouter(props: GroupsListRouterProps) {
  const { pathRoot, queryGroups } = props;
  const url = useUrl();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(
    url.get(ID_PARAM) || null,
  );
  const page = Number(url.get(PAGE_PARAM));

  const query = useQuery(
    (search, groupId) => {
      let where: string | undefined;
      let params: string[] | undefined;
      if (groupId) {
        where = 'id = $1';
        params = [groupId as string];
      } else if (search) {
        where = 'name like $1';
        params = [`%${search}%`];
      } else {
        where = undefined;
        params = undefined;
      }

      return queryGroups(
        {
          page,
          where,
        },
        params,
      );
    },
    {
      debounce: 500,
    },
  );

  useEffect(() => {
    query.execute(null, url.get(ID_PARAM));
  }, []);

  useEffect(() => {
    setSelected(url.get(ID_PARAM));
  }, [url.get(ID_PARAM)]);

  useEffect(() => {
    if (selected) {
      router.push(url.set(ID_PARAM, selected));
    } else if (!selected && url.url() !== pathRoot) {
      query.execute(null, null);
      router.push(url.delete(ID_PARAM));
    }
  }, [pathRoot, selected]);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Input
            onChange={(e) => {
              query.execute(e.target.value, null);
            }}
            className="mb-2"
          />
          <div>
            {!query.loading &&
              _.map(query.data?.rows, (g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    // un toggle current selection
                    if (selected === g.id) {
                      setSelected(null);
                    } else {
                      setSelected(g.id);
                    }
                  }}
                  className={cn(
                    'flex flex-row items-center space-x-4 p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer',
                    g.id === selected && 'bg-accent',
                  )}
                >
                  {g._name}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      g.id === selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </div>
      <CardFooter className="space-x-2 justify-end">
        <Button
          variant="outline"
          disabled={!page || page === 0}
          asChild={!(!page || page === 0)}
        >
          <Link href={url.set(PAGE_PARAM, String(page - 1))}>Previous</Link>
        </Button>
        <Button
          variant="outline"
          disabled={query.data?.rowCount !== PAGE_SIZE}
          asChild={query.data?.rowCount === PAGE_SIZE}
        >
          <Link href={url.set(PAGE_PARAM, String(page + 1))}>Next</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
