import _ from 'lodash';
import Link from 'next/link';

import buildQuery from '~/libs/buildQuery';
import sql from '~/libs/db';
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

interface GroupsMembersListProps {
  parent_id: string;
  page?: number;
}

interface QueryGroupChildrenArgs {
  parent_id: string;
  page?: number;
}
interface UserOrGroup {
  id: string;
  name: string;
  created_at: Date;
  type: 'user' | 'group';
}

const queryGroupChildren = async ({
  parent_id,
  page,
}: QueryGroupChildrenArgs) =>
  buildQuery<UserOrGroup>(
    sql,
    `
      select
          id,
          name,
          created_at,
          type
      from ${process.env.PUBLIC_SCHEMA}.recent_nodes_view
      where parent_id = '${parent_id}' and (type = 'group' or type = 'user')
      limit ${PAGE_SIZE}
      offset ${page || 0}
    `,
  );

export default async function GroupsMembersList(props: GroupsMembersListProps) {
  const { parent_id, page } = props;

  const { data, errorMessage } = await queryGroupChildren({ parent_id });
  if (errorMessage) {
    return <div className="text-error">{errorMessage}</div>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Members</CardTitle>
        <CardContent className="py-6 px-0">
          <div className="grid gap-1">
            {data.rowCount === 0 && (
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
            {data.rowCount > 0 &&
              _.map(data.rows, (r) => {
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
        <CardFooter className="px-0 space-x-2 justify-end">
          <Button variant="outline" disabled={!page || page === 0}>
            Previous
          </Button>
          <Button variant="outline" disabled={data.rowCount !== PAGE_SIZE}>
            Next
          </Button>
        </CardFooter>
      </CardHeader>
    </Card>
  );
}
