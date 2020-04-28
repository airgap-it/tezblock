import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'

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
    data: (item: any) => ({ data: item.balance }),
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
    data: (item: any) => ({ data: item.staking_balance }),
    sortable: true
  },
  {
    name: '# of Delegators',
    field: 'number_of_delegators'
  }
]
