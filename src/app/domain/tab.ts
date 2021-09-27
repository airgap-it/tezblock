import { pipe } from 'rxjs';

import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';
import { OperationTypes } from '@tezblock/domain/operations';
import { OperationCount } from '@tezblock/services/api/api.service';
import { groupBy } from '@tezblock/services/fp';

const toLowerCase = (value: string): string =>
  value ? value.toLowerCase() : value;

export type KindType = string | string[];

export interface Tab {
  title: string;
  active: boolean;
  count: number;
  kind: KindType;
  disabled: () => boolean;
  icon?: string[];
  columns?: Column[];
  emptySign?: string;
}

export interface Count {
  key: string;
  count: number;
}

export interface GetTabsArguments {
  options: { pageId: string; showFiatValue: boolean };
  counts: Count[];
}

export const isTabKindEqualTo =
  (kind: string) =>
  (tab: Tab): boolean =>
    Array.isArray(tab.kind) ? tab.kind.indexOf(kind) !== -1 : tab.kind === kind;

export const compareTabWith = (anotherTabTitle: string) => (tab: Tab) =>
  toLowerCase(tab.title) === toLowerCase(anotherTabTitle);

export const kindToOperationTypes = (kind: KindType): string =>
  Array.isArray(kind) ? OperationTypes.Ballot : kind;

const proposalsToBallot = (
  operationCounts: OperationCount[]
): OperationCount[] =>
  operationCounts.map((operationCount) => ({
    ...operationCount,
    kind: operationCount.kind === 'proposals' ? 'ballot' : operationCount.kind,
  }));
const sumCounts = (aggreagted: { [key: string]: OperationCount[] }): Count[] =>
  Object.keys(aggreagted).map((key) => ({
    key,
    count: aggreagted[key]
      .map((aggreagtedItem) =>
        parseInt(aggreagtedItem[`count_${aggreagtedItem.field}`], 10)
      )
      .reduce((a, b) => a + b),
  }));

export const aggregateOperationCounts = pipe(
  proposalsToBallot,
  groupBy<OperationCount>('kind'),
  sumCounts
);

export const updateTabCounts = (tabs: Tab[], counts: Count[]): Tab[] =>
  tabs.map((tab) => {
    const match = counts.find((count) => isTabKindEqualTo(count.key)(tab));

    return { ...tab, count: match ? match.count : 0 };
  });
