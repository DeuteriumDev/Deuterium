import _ from 'lodash';
import { User2, Users, Lock, FileText, LucideIcon } from 'lucide-react';
import postgres, { Sql } from 'postgres';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/Card';
import sql from '~/lib/db';

export const NODE_CARDS_CONFIG = {
  users: User2,
  groups: Users,
  permissions: Lock,
  documents: FileText,
};

export type NodeType = 'users' | 'groups' | 'permissions' | 'documents';

interface NodeGrowthResult {
  type: NodeType;
  total: number;
  count_this_month: number;
}

export async function queryNodeGrowths() {
  let data;
  let errorMessage = null;

  try {
    data = await sql<NodeGrowthResult[]>`
      select *
      from public.node_growth
    `;
  } catch (e) {
    if (e instanceof Error && e.name === 'PostgresError') {
      errorMessage = `Postgres error: ${e.cause}`;
    } else {
      errorMessage = 'Error';
    }
  }

  return {
    data,
    errorMessage,
  };
}

export default async function NodeGrowthCards() {
  const { data, errorMessage } = await queryNodeGrowths();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {errorMessage && <div>{errorMessage}</div>}
      {_.map(data, (d) => {
        const Icon = NODE_CARDS_CONFIG[d.type];
        return (
          <Card key={d.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {d.type}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{d.total}</div>
              <p className="text-xs text-muted-foreground">
                +{d.count_this_month} this month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
