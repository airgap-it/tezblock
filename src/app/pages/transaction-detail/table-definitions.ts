import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { isConvertableToUSD } from '@tezblock/domain/airgap'

export const columns: { [key: string]: (options: { pageId: string; showFiatValue: boolean }) => Column[] } = {
  [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'From',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { pageId: options.pageId, showFullAddress: false } }),
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
      template: Template.address,
      data: (item: Transaction) => ({ data: item.destination, options: { pageId: options.pageId, showFullAddress: false } }),
      sortable: false
    },
    {
      name: 'Amount',
      field: 'amount',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.amount,
        options: {
          maxDigits: 8,
          comparisonTimestamp: item.timestamp,
          symbol: item.symbol,
          showFiatValue: !item.symbol || isConvertableToUSD(item.symbol)
        }
      }),
      sortable: true
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: { showFiatValue: false, maxDigits: 8, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
      }),
      sortable: true
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit',
      sortable: false
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit',
      sortable: false
    },
    {
      name: 'Parameters',
      field: 'parameters',
      template: Template.modal,
      sortable: false
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: true
    }
  ],

  [OperationTypes.Delegation]: (options: { pageId: string; showFiatValue: boolean }) => [
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
        options: { showFullAddress: false, pageId: options.pageId, isText: item.delegate ? undefined : true }
      }),
      sortable: false
    },
    {
      name: 'Value',
      field: 'delegatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.delegatedBalance, options: { ...options, comparisonTimestamp: item.timestamp } }),
      sortable: true
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: { showFiatValue: false, maxDigits: 8, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
      }),
      sortable: true
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit',
      sortable: false
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit',
      sortable: false
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: true
    }
  ],

  [OperationTypes.Origination]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'New Account',
      field: 'originated_contracts',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: 'Balance',
      field: 'originatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.originatedBalance, options: { ...options, comparisonTimestamp: item.timestamp } }),
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
      data: (item: Transaction) => ({
        data: item.fee,
        options: { showFiatValue: false, maxDigits: 8, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
      }),
      sortable: false
    },
    {
      name: 'Burn',
      field: 'burn',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.burn, options: { showFiatValue: false } }),
      sortable: false
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit',
      sortable: false
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit',
      sortable: false
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: true
    }
  ],

  [OperationTypes.Reveal]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Account',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: 'Public Key',
      field: 'public_key',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.public_key, options: { showFullAddress: false } }),
      sortable: false
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({
        data: item.fee,
        options: { showFiatValue: false, maxDigits: 8, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
      }),
      sortable: true
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit',
      sortable: false
    },
    {
      name: 'Storage Limit',
      field: 'storage_limit',
      sortable: false
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: true
    }
  ],

  [OperationTypes.Activation]: (options: { pageId: string; showFiatValue: boolean }) =>
    [
      {
        name: 'Account',
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Secret',
        field: 'secret',
        sortable: false
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Ballot]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Baker',
      field: 'source',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: 'Ballot',
      field: 'ballot',
      sortable: false
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp,
      sortable: false
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
      name: 'Proposal',
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } }),
      sortable: false
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: false
    }
  ]
}
