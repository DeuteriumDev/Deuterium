'use sever';

import _ from 'lodash';
import * as React from 'react';
import Link from 'next/link';

import Button from '~/components/Button';
import { Table, TableBody, TableCell, TableRow } from '~/components/Table';
import sql from '~/lib/db';
import type { Sql } from 'postgres';

export type Node = {
  id: string;
  name: React.ReactNode;
  type: 'user' | 'group' | 'permission' | 'document';
  createdAt: string;
};

const PAGE_SIZE = 10;
const TABLE_COLS = ['name', 'type', 'createdAt'] as (keyof Node)[];

interface RecentActivityTableProps {
  page: number;
}

export async function queryRecentNodes(client: Sql, page: number) {
  const data = await client`
    select *
    from public.recent_nodes
    ${client`limit ${PAGE_SIZE}`}
    ${client`offset ${page * PAGE_SIZE}`}
  `;

  return {
    data: _.map(data, (d) => ({
      id: d.id,
      name: (
        <Link href={`/node/${d.type}/${d.id}`} className="underline">
          {d.name}
        </Link>
      ),
      type: d.type,
      createdAt: (d.created_at as Date).toISOString(),
    })) as Node[],
    total: data.length,
  };
}

export default async function RecentActivityTable(
  props: RecentActivityTableProps,
) {
  const { page = 0 } = props;
  const { data, total } = await queryRecentNodes(sql, page);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <h2 className="ml-1 text-2xl font-bold tracking-tight">
          Recently Created Nodes
        </h2>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {data ? (
              _.map(data, (d) => (
                <TableRow key={d.id}>
                  {_.map(TABLE_COLS, (colName) => (
                    <TableCell key={`${d.id}-${colName}`}>
                      {d[colName]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLS.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            asChild={page > 0}
          >
            <Link href={`/dashboard?page=${page - 1}`}>Previous</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={total < (page + 1) * PAGE_SIZE}
            asChild={total > (page + 1) * PAGE_SIZE}
          >
            <Link href={`/dashboard?page=${page + 1}`}>Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
