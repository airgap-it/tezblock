import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'

export const columns: { [key: string]: (options: { pageId: string; showFiatValue: boolean }) => Column[] } = {
  [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'From',
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol
      },
      {
        name: 'To',
        field: 'destination',
        width: '1',
        data: (item: Transaction) => ({ data: item.destination, options: { showFullAddress: false, pageId: options.pageId } }),
        template: Template.address
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Amount',
        field: 'amount',
        data: (item: Transaction) => ({ data: item.amount, options }),
        template: Template.amount,
        sortable: true
      },
      {
        name: 'Fee',
        field: 'fee',
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
        template: Template.amount,
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Delegation]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'Delegator',
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, pageId: options.pageId, isText: !item.delegate ? true : undefined }
        })
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Amount',
        field: 'delegatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.delegatedBalance, options }),
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Origination]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'New Account',
        field: 'originated_contracts',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } })
      },
      {
        name: 'Balance',
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.originatedBalance, options }),
        sortable: true
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Originator',
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } })
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Endorsement]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: 'Slots',
      field: 'slots',
      sortable: false
    },
    {
      name: 'Endorsed Level',
      field: 'level',
      template: Template.block
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: true
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
    }
  ],

  [OperationTypes.Ballot]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'Ballot',
        field: 'ballot'
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Kind',
        field: 'kind',
        sortable: false
      },
      {
        name: 'Voting Period',
        field: 'voting_period',
        sortable: false
      },
      {
        name: '# of Votes',
        field: 'votes',
        sortable: false
      },
      {
        name: 'Proposal Hash',
        field: 'proposal',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } })
      }
    ].concat(<any>blockAndTxHashColumns)
}
