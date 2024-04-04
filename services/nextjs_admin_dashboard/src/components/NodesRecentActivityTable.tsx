'use sever';

import _ from 'lodash';
import * as React from 'react';
import Link from 'next/link';

import Button from '~/components/Button';
import { Table, TableBody, TableCell, TableRow } from '~/components/Table';
import sql from '~/lib/db';
import formatCellContent from '~/lib/formatCellContent';
import buildQuery from '~/lib/buildQuery';

export type Node = {
  id: string;
  name: string;
  type: 'user' | 'group' | 'permission' | 'document';
  created_at: Date;
};

const PAGE_SIZE = 10;
const TABLE_COLS = ['name', 'type', 'created_at'] as (keyof Node)[];

interface NodesRecentActivityTableProps {
  page: number;
}

const queryRecentNodes = async ({ page }: { page: number }) =>
  buildQuery<Node>(
    sql,
    `
select 
  id,
  '[' || name || '](/nodes/' || type || 's/' || id || ')' as name,
  type,
  created_at
from public.recent_nodes_view
limit ${PAGE_SIZE}
offset ${page * PAGE_SIZE}
`,
  );

export default async function NodesRecentActivityTable(
  props: NodesRecentActivityTableProps,
) {
  const { page = 0 } = props;
  const { data, errorMessage } = await queryRecentNodes({ page });

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
            {errorMessage && (
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLS.length}
                  className="h-24 text-center text-error"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
            {!errorMessage &&
              data.rows &&
              _.map(data.rows, (d) => (
                <TableRow key={d.id}>
                  {_.map(TABLE_COLS, (colName) => (
                    <TableCell key={`${d.id}-${colName}`}>
                      {formatCellContent(d[colName])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!errorMessage && data.rowCount === 0 && (
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
            disabled={data.rowCount < (page + 1) * PAGE_SIZE}
            asChild={data.rowCount > (page + 1) * PAGE_SIZE}
          >
            <Link href={`/dashboard?page=${page + 1}`}>Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
