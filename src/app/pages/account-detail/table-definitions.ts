import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
import { Transaction } from '@tezblock/interfaces/Transaction'

export const columns: { [key: string]: (pageId: string) => Column[] } = {
    [OperationTypes.Transaction]: (pageId: string) => [
        {
            name: 'From',
            field: 'source',
            width: '1',
            template: Template.address,
            data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId } })
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
            data: (item: Transaction) => ({ data: item.destination, options: { showFullAddress: false, pageId } }),
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
            data: (item: Transaction) => ({ data: item.amount, options: { showFiatValue: true } }),
            template: Template.amount
          },
          {
            name: 'Fee',
            field: 'fee',
            data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
            template: Template.amount
          }
    ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Delegation]: (pageId: string) => [
        {
            name: 'Delegator',
            field: 'source',
            width: '1',
            template: Template.address,
            data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId } })
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
              options: { showFullAddress: false, pageId, isText: !item.delegate ? true : undefined }
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
            data: (item: Transaction) => ({ data: item.delegatedBalance, options: { showFiatValue: true } })
          }
    ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Origination]: (pageId: string) => [
        {
            name: 'New Account',
            field: 'originated_contracts',
            template: Template.address,
            data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId } })
          },
          {
            name: 'Balance',
            field: 'originatedBalance',
            template: Template.amount,
            data: (item: Transaction) => ({ data: item.originatedBalance, options: { showFiatValue: true } })
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
            data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId } })
          },
          {
            name: 'Baker',
            field: 'delegate',
            width: '1',
            template: Template.address,
            data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId } })
          },
          {
            name: 'Fee',
            field: 'fee',
            template: Template.amount,
            data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
          }
    ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Endorsement]: () => [
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

    [OperationTypes.Ballot]: () => [
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
