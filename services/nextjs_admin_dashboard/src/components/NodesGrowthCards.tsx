import _ from 'lodash';
import { User2, Users, Lock, FileText } from 'lucide-react';

import queryNodesGrowths from '~/actions/queryNodeGrowths';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/Card';

export const NODES_CARDS_CONFIG = {
  user: User2,
  group: Users,
  permission: Lock,
  document: FileText,
};

interface NodeGrowthCardsProps {
  queryNodesGrowths: typeof queryNodesGrowths;
}

export default async function NodesGrowthCards(props: NodeGrowthCardsProps) {
  const { queryNodesGrowths } = props;
  const { data, errorMessage } = await queryNodesGrowths();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {errorMessage && <div>{errorMessage}</div>}
      {_.map(data?.rows, (d) => {
        const Icon = NODES_CARDS_CONFIG[d.type];
        return (
          <Card key={d.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {`${d.type}s`}
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
