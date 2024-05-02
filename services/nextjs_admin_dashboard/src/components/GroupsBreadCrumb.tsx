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
import { Group } from '~/libs/types';

interface GroupsBreadCrumbProps {
  groupsCrumbs: (Group | Group[])[];
}

const BREADCRUMB_CONCAT_COUNT = 5;

export default function GroupsBreadCrumb(props: GroupsBreadCrumbProps) {
  const { groupsCrumbs } = props;

  const crumbs =
    groupsCrumbs.length >= BREADCRUMB_CONCAT_COUNT
      ? [
          _.filter(
            groupsCrumbs,
            (_r, index) => index !== groupsCrumbs.length - 1,
          ),
          _.last(groupsCrumbs),
        ]
      : groupsCrumbs;

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
              <div
                key={`crumb-${(crumbOrArray as Group).id}`}
                className="contents"
              >
                <BreadcrumbSeparator />
                <Crumb>
                  <BreadcrumbLink
                    href={`/groups/${(crumbOrArray as Group).id}`}
                  >
                    {(crumbOrArray as Group).name}
                  </BreadcrumbLink>
                </Crumb>
              </div>
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
