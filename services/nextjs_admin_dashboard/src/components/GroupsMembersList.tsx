import _ from 'lodash';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/Card';
import { PAGE_SIZE } from '~/config';
import formatCellContent from '~/libs/formatCellContent';
import { NODES_CARDS_CONFIG } from '~/components/NodesGrowthCards';
import Button from '~/components/Button';
import queryGroupChildren from '~/actions/queryGroupChildren';

interface GroupsMembersListProps {
  parent_id: string;
  page?: number;
}

export default async function GroupsMembersList(props: GroupsMembersListProps) {
  const { parent_id, page } = props;

  const { data, errorMessage } = await queryGroupChildren({ parent_id });
  if (errorMessage) {
    return <div className="text-error">{errorMessage}</div>;
  }
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-1">
            {data?.rowCount === 0 && (
              <>
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      No subgroups or users
                    </p>
                  </div>
                </div>
                <div className="flex h-20" />
              </>
            )}
            {(data?.rowCount || 0) > 0 &&
              _.map(data?.rows, (r) => {
                const Icon = NODES_CARDS_CONFIG[r.type];
                return (
                  <div
                    key={r.id}
                    className="-mx-2 flex items-start space-x-4 p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="mt-px h-5 w-5" />
                    <div className="space-y-1">
                      <Link href={`/${r.type}s/${r.id}`}>
                        <p className="text-sm font-medium leading-none underline">
                          {r.name}
                        </p>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Created: {formatCellContent(r.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </div>
      <CardFooter className="space-x-2 justify-end">
        <Button
          variant="outline"
          disabled={!page || page === 0}
          asChild={!(!page || page === 0)}
        >
          <Link href={{ query: { page: (page || 0) - 1 } }}>Previous</Link>
        </Button>
        <Button
          variant="outline"
          disabled={data?.rowCount !== PAGE_SIZE}
          asChild={data?.rowCount === PAGE_SIZE}
        >
          <Link href={{ query: { page: (page || 1) + 1 } }}>Next</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
