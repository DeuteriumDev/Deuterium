import _ from 'lodash';
import { User2, Users, Lock, FileText, LucideIcon } from 'lucide-react';
import postgres from 'postgres';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/Card';
import sql from '~/lib/db';
import { delay } from '~/lib/utils';

interface DashboardCard {
  title: string;
  query: () => Promise<postgres.RowList<postgres.Row[]>>;
  icon: LucideIcon;
}

export const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: 'Users',
    query: () => sql`select count(*) from public.users`,
    icon: User2,
  },
  {
    title: 'Groups',
    query: () => sql`select count(*) from public.groups`,
    icon: Users,
  },
  {
    title: 'Permissions',
    query: () => sql`select count(*) from public.document_permissions`,
    icon: Lock,
  },
  {
    title: 'Documents',
    query: () => sql`select count(*) from private.documents`,
    icon: FileText,
  },
];

export async function queryDashboardCounts() {
  let counts = Array(DASHBOARD_CARDS.length).fill(null);
  let error = null;

  try {
    counts = await Promise.all(
      _.map(DASHBOARD_CARDS, async (d) => (await d.query())[0].count),
    );
  } catch (e) {
    error = e as Error;
  }

  return {
    counts,
    error,
  };
}

export default async function DashboardCards() {
  const { counts, error } = await queryDashboardCounts();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {error && <div>error</div>}
      {!error &&
        _.map(DASHBOARD_CARDS, (card, index) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts[index]}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
