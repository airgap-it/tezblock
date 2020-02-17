import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'

export const columns: Column[] = [
  {
    name: 'Baker',
    field: 'source',
    width: '1',
    template: Template.address
  },
  {
    name: 'Ballot',
    field: 'ballot'
  },
  {
    name: 'Age',
    field: 'timestamp',
    template: Template.timestamp
  },
  // {
  //   name: 'Kind',
  //   field: 'kind'
  // },
  // {
  //   name: 'Voting Period',
  //   field: 'voting_period'
  // },
  {
    name: '# of Votes',
    field: 'votes'
  }
].concat(<any>blockAndTxHashColumns)
