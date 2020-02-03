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
    template: Template.amount
  },
  {
    name: '# of Votes',
    field: 'number_of_votes'
  },
  {
    name: 'Staking Balance',
    field: 'staking_balance',
    template: Template.amount
  },
  {
    name: '# of Delegators',
    field: 'number_of_delegators'
  }
]
