'use server';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDownIcon,
  Check,
  RotateCcwSquare,
} from 'lucide-react';
import _ from 'lodash';
import Link from 'next/link';

import Button from '~/components/Button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/Table';
import NodesFilterForm from '~/components/NodesFilterForm';
import sql from '~/lib/db';

export interface Document {
  id: string;
  type: string;
  name: string;
  created_at: Date;
}

const PAGE_SIZE = 10;

type QueryDocumentOrderArgs = {
  page: number;
  orderBy: string;
  orderDir: string;
};

type QueryDocumentWhereArgs = {
  where: string;
  page: number;
};

type QueryDocumentArgs =
  | {
      page: number;
    }
  | QueryDocumentOrderArgs
  | QueryDocumentWhereArgs;

export async function queryPermissions(
  client: typeof sql,
  args: QueryDocumentArgs,
) {
  const { page } = args;
  const { orderBy, orderDir } = args as QueryDocumentOrderArgs;
  const { where } = args as QueryDocumentWhereArgs;

  let data = { rows: [] as Document[], rowCount: 0 };
  let errorMessage;
  try {
    data = await client<Document>(`
      select *
      from documents_view
      ${where ? `where ${where}` : ''}
      ${orderBy && orderBy ? `order by ${orderBy} ${orderDir}` : ''}
      limit ${PAGE_SIZE}
      offset ${page * PAGE_SIZE}
    `);
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  }

  return {
    data,
    errorMessage,
  };
}

const columns: (keyof Document)[] = ['name', 'created_at', 'type'];

interface DocumentsSearchParams {
  hiddenColumns?: string[];
  page?: number;
  orderBy?: string;
  orderDir?: string;
  where?: string;
}

interface DocumentsTableProps extends Required<DocumentsSearchParams> {}

export default async function DocumentsTable(props: DocumentsTableProps) {
  const {
    hiddenColumns = [],
    page = 0,
    orderDir = '',
    orderBy = '',
    where = '',
  } = props;
  const { data, errorMessage } = await queryPermissions(sql, {
    page,
    orderBy,
    orderDir,
    where,
  });

  const buildQuery = (params?: DocumentsSearchParams) => ({
    query: {
      hiddenColumns: params?.hiddenColumns || hiddenColumns,
      page: params?.page || page,
      orderBy: params?.orderBy || orderBy,
      orderDir: params?.orderDir || orderDir,
      where: params?.where || where,
    },
  });

  const getHeaderIcon = (header: string) => {
    if (orderBy === header) {
      if (orderDir === 'asc') {
        return <ArrowDown className="h-4 w-4" />;
      } else {
        return <ArrowUp className="h-4 w-4" />;
      }
    }
    return null;
  };

  const formatCell = (cell: unknown): string => {
    if (cell instanceof Date) {
      return (cell as Date).toUTCString();
    } else if (typeof cell === 'boolean') {
      return cell.toString();
    }

    return cell as string;
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <NodesFilterForm query={buildQuery().query} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {_.map(columns, (column) => (
              <DropdownMenuItem key={`dropdown-${column}`} asChild>
                <Link
                  replace
                  href={buildQuery({
                    hiddenColumns:
                      _.indexOf(hiddenColumns, column) === -1
                        ? _.concat(hiddenColumns, column)
                        : _.without(hiddenColumns, column),
                  })}
                  className="flex"
                >
                  {_.indexOf(hiddenColumns, column) === -1 ? (
                    <span className="left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="w-4" />
                  )}

                  {column}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild variant="outline" className="ml-2">
          <Link href="?">
            <RotateCcwSquare className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {_.map(_.without(columns, ...hiddenColumns), (column) => (
                <TableHead key={`header-${column}`}>
                  <Link
                    replace
                    href={buildQuery({
                      orderBy: column,
                      orderDir: orderDir === 'asc' ? 'desc' : 'asc',
                    })}
                    className="flex"
                  >
                    {getHeaderIcon(column)}
                    {column}
                  </Link>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorMessage && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-error"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
            {!errorMessage &&
              data?.rowCount > 0 &&
              _.map(data.rows, (row) => (
                <TableRow key={row.id}>
                  {_.map(
                    _.without(columns, ...hiddenColumns),
                    (column: keyof Document) => (
                      <TableCell key={`cell-${column}-${row.id}`}>
                        {formatCell(row[column])}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            {!errorMessage && data?.rowCount === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
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
            <Link replace href={buildQuery({ page: page - 1 })}>
              Previous
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data.rowCount < PAGE_SIZE}
            asChild={data.rowCount === PAGE_SIZE}
          >
            <Link replace href={buildQuery({ page: page + 1 })}>
              Next
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
