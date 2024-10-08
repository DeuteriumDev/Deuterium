import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDownIcon,
  Check,
  RotateCcwSquare,
  PlusCircle,
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
import formatCellContent from '~/libs/formatCellContent';

interface SearchParams {
  hiddenColumns?: string[];
  page?: number;
  orderBy?: string;
  orderDir?: string;
  where?: string;
}
type Row = Record<string, unknown> & { id: string };
interface RouterTableProps extends Required<SearchParams> {
  columns: (keyof Row)[];
  rows: Row[];
  pageSize: number;
  errorMessage?: string | null;
  newLink?: string;
}

export default function RouterTable(props: RouterTableProps) {
  const {
    hiddenColumns = [],
    page = 0,
    orderDir = '',
    orderBy = '',
    where = '',
    columns,
    rows,
    pageSize,
    errorMessage,
    newLink,
  } = props;

  const buildQuery = (params?: SearchParams) => ({
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
        {newLink && (
          <Button asChild className="ml-2">
            <Link href={newLink}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New
            </Link>
          </Button>
        )}
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
            {rows.length > 0 &&
              _.map(rows, (row) => (
                <TableRow key={row.id}>
                  {_.map(_.without(columns, ...hiddenColumns), (column) => (
                    <TableCell key={`cell-${column}-${row.id}`}>
                      {formatCellContent(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!errorMessage && rows.length === 0 && (
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
            disabled={rows.length < pageSize}
            asChild={rows.length === pageSize}
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
