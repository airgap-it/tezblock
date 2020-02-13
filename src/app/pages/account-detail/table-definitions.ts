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
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        sortable: false
      },
      {
        name: 'To',
        field: 'destination',
        width: '1',
        data: (item: Transaction) => ({ data: item.destination, options: { showFullAddress: false, pageId: options.pageId } }),
        template: Template.address,
        sortable: false
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
        data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options }),
        template: Template.amount,
        sortable: true
      },
      {
        name: 'Fee',
        field: 'fee',
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
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
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        sortable: false
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, pageId: options.pageId, isText: !item.delegate ? true : undefined }
        }),
        sortable: false
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
        data: (item: Transaction) => ({ data: { amount: item.delegatedBalance, timestamp: item.timestamp }, options }),
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Origination]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'New Account',
        field: 'originated_contracts',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: 'Balance',
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options }),
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
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
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
      template: Template.block,
      sortable: false
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
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } }),
      sortable: false
    }
  ],

  [OperationTypes.Ballot]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'Ballot',
        field: 'ballot',
        sortable: false
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
        data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } }),
        sortable: false
      }
    ].concat(<any>blockAndTxHashColumns)
}
