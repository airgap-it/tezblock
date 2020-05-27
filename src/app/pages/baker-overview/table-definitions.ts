import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Block } from '@tezblock/interfaces/Block'
import { TranslateService } from '@ngx-translate/core'

export const columns = (translate: TranslateService): Column[] => [
  {
    name: translate.instant('tezblock-table.baker-overview.baker'),
    field: 'pkh',
    template: Template.address
  },
  {
    name: translate.instant('tezblock-table.baker-overview.balance'),
    field: 'balance',
    template: Template.amount,
    data: (item: any) => ({ data: { amount: item.balance } }),
    sortable: true
  },
  {
    name: translate.instant('tezblock-table.baker-overview.number-of-votes'),
    field: 'number_of_votes'
  },
  {
    name: translate.instant('tezblock-table.baker-overview.staking-balance'),
    field: 'staking_balance',
    template: Template.amount,
    data: (item: any) => ({ data: { amount: item.staking_balance } }),
    sortable: true
  },
  {
    name: translate.instant('tezblock-table.baker-overview.number-of-delegators'),
    field: 'number_of_delegators'
  }
]
