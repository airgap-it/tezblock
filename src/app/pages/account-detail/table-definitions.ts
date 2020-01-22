import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'

export const columns: { [key: string]: (options: { pageId: string, showFiatValue: boolean }) => Column[] } = {
    [OperationTypes.Transaction]: (options: { pageId: string, showFiatValue: boolean }) => [
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
            template: Template.timestamp
          },
          {
            name: 'Amount',
            field: 'amount',
            data: (item: Transaction) => ({ data: item.amount, options }),
            template: Template.amount
          },
          {
            name: 'Fee',
            field: 'fee',
            data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
            template: Template.amount
          }
    ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Delegation]: (options: { pageId: string, showFiatValue: boolean }) => [
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
            template: Template.timestamp
          },
          {
            name: 'Amount',
            field: 'delegatedBalance',
            template: Template.amount,
            data: (item: Transaction) => ({ data: item.delegatedBalance, options })
          }
    ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Origination]: (options: { pageId: string, showFiatValue: boolean }) => [
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
            data: (item: Transaction) => ({ data: item.originatedBalance, options })
          },
          {
            name: 'Age',
            field: 'timestamp',
            template: Template.timestamp
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
            data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
          }
    ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Endorsement]: (options: { pageId: string, showFiatValue: boolean }) => [
        {
            name: 'Age',
            field: 'timestamp',
            template: Template.timestamp
          },
          {
            name: 'Slots',
            field: 'slots'
          },
          {
            name: 'Endorsed Level',
            field: 'level',
            template: Template.block
          },
          {
            name: 'Block',
            field: 'block_level',
            template: Template.block
          },
          {
            name: 'Tx Hash',
            field: 'operation_group_hash',
            template: Template.hash,
            data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
          }
    ],

    [OperationTypes.Ballot]: (options: { pageId: string, showFiatValue: boolean }) => [
        {
            name: 'Ballot',
            field: 'ballot'
          },
          {
            name: 'Age',
            field: 'timestamp',
            template: Template.timestamp
          },
          {
            name: 'Kind',
            field: 'kind'
          },
          {
            name: 'Voting Period',
            field: 'voting_period'
          },
          {
            name: '# of Votes',
            field: 'votes'
          },
          {
            name: 'Proposal Hash',
            field: 'proposal',
            template: Template.hash,
            data: (item: Transaction) => ({ data: item.proposal })
          }
    ].concat(<any>blockAndTxHashColumns)
}
