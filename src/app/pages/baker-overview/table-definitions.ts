import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Block } from '@tezblock/interfaces/Block'

export const columns: Column[] = [
  {
    name: 'Baker',
    field: 'pkh',
    template: Template.address
  },
  {
    name: 'Balance',
    field: 'balance',
    template: Template.amount,
    data: (item: any) => ({ data: { amount: item.balance } }),
    sortable: true
  },
  {
    name: '# of Votes',
    field: 'number_of_votes'
  },
  {
    name: 'Staking Balance',
    field: 'staking_balance',
    template: Template.amount,
    data: (item: any) => ({ data: { amount: item.staking_balance } }),
    sortable: true
  },
  {
    name: '# of Delegators',
    field: 'number_of_delegators'
  }
]
