'use server';

import _ from 'lodash';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/Breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/DropdownMenu';
import buildQuery from '~/lib/buildQuery';
import sql from '~/lib/db';
import { Group } from '~/lib/types';

interface GroupsBreadCrumbProps {
  id: string;
}

interface QueryGroupsBreadcrumbsArgs {
  id: string;
}

const queryGroupBreadcrumbs = async ({ id }: QueryGroupsBreadcrumbsArgs) =>
  buildQuery<Group>(
    sql,
    `
      with recursive groups_with_path(id, name, parent_id, created_at, index) as (
          select
              id,
              name,
              parent_id,
              created_at,
              0 as index
          from groups
          where id = '${id}'
          union
          select
              g.id,
              g.name,
              g.parent_id,
              g.created_at,
              gp.index + 1 as index
          from groups g
          join groups_with_path gp on gp.parent_id = g.id
      )
      select
          id,
          name,
          parent_id,
          created_at
      from groups_with_path
      order by index desc
    `,
  );

const BREADCRUMB_CONCAT_COUNT = 5;

export default async function GroupsBreadCrumb(props: GroupsBreadCrumbProps) {
  const { id } = props;
  const { data, errorMessage } = await queryGroupBreadcrumbs({ id });

  const crumbs =
    data.rowCount >= BREADCRUMB_CONCAT_COUNT
      ? [
          _.filter(data.rows, (_r, index) => index !== data.rowCount - 1),
          _.last(data.rows),
        ]
      : data.rows;

  if (errorMessage) {
    return <div className="text-error">{errorMessage}</div>;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/groups/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {_.map(crumbs, (crumbOrArray, index) => {
          if (!_.isArray(crumbOrArray)) {
            const Crumb =
              crumbs.length - 1 === index ? BreadcrumbPage : BreadcrumbItem;
            return (
              <>
                <BreadcrumbSeparator />
                <Crumb key={`crumb-${(crumbOrArray as Group).id}`}>
                  <BreadcrumbLink
                    href={`/nodes/groups/${(crumbOrArray as Group).id}`}
                  >
                    {(crumbOrArray as Group).name}
                  </BreadcrumbLink>
                </Crumb>
              </>
            );
          }
          return (
            <BreadcrumbItem
              key={`crumb-menu-${(crumbOrArray as unknown as Group[])[0].id}`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {_.map(crumbOrArray as unknown as Group[], (c) => (
                    <DropdownMenuItem key={c.id} asChild>
                      <Link href={`/nodes/groups/${c.id}`}>{c.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
