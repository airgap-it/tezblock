import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'

export const columns: { [key: string]: (options: { pageId: string; showFiatValue: boolean }) => Column[] } = {
  [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'From',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { pageId: options.pageId, showFullAddress: false } })
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
      template: Template.address,
      data: (item: Transaction) => ({ data: item.destination, options: { pageId: options.pageId, showFullAddress: false } })
    },
    {
      name: 'Amount',
      field: 'amount',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } })
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit'
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit'
    },
    {
      name: 'Parameters',
      field: 'parameters',
      template: Template.modal
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block
    }
  ],

  [OperationTypes.Delegation]: (options: { pageId: string; showFiatValue: boolean }) => [
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
        options: { showFullAddress: false, pageId: options.pageId, isText: item.delegate ? undefined : true }
      })
    },
    {
      name: 'Value',
      field: 'delegatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.delegatedBalance, timestamp: item.timestamp }, options })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } })
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit'
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit'
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block
    }
  ],

  [OperationTypes.Origination]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'New Account',
      field: 'originated_contracts',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: 'Balance',
      field: 'originatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options })
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
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } })
    },
    {
      name: 'Burn',
      field: 'burn',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.burn, options: { showFiatValue: false } })
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit'
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit'
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block
    }
  ],

  [OperationTypes.Reveal]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Account',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: 'Public Key',
      field: 'public_key',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.public_key, options: { showFullAddress: false } })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } })
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit'
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit'
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block
    }
  ],

  [OperationTypes.Activation]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'Account',
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true, pageId: options.pageId } })
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Secret',
        field: 'secret'
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Ballot]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Baker',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
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
      name: 'Proposal',
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } })
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block
    }
  ]
}
