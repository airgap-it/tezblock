import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'

export const columns: { [key: string]: (options: { pageId: string; showFiatValue: boolean }) => Column[] } = {
  [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean }) => [
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
      name: 'Amount',
      field: 'amount',
      data: (item: Transaction) => ({ data: item.amount, options: { ...options, comparisonTimestamp: item.timestamp } }),
      template: Template.amount,
      sortable: true
    },
    {
      name: 'Fee',
      field: 'fee',
      data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: true, comparisonTimestamp: item.timestamp } }),
      template: Template.amount,
      sortable: true
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit',
      sortable: false
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash }),
      sortable: false
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
        options: { showFullAddress: false, pageId: options.pageId, isText: !item.delegate ? true : undefined }
      }),
      sortable: false
    },
    {
      name: 'Amount',
      field: 'delegatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.delegatedBalance, options: { ...options, comparisonTimestamp: item.timestamp } }),
      sortable: true
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: true, comparisonTimestamp: item.timestamp } }),
      sortable: true
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit',
      sortable: false
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash }),
      sortable: false
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
      data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: true, comparisonTimestamp: item.timestamp } }),
      sortable: true
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
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash }),
      sortable: false
    }
  ],

  [OperationTypes.Endorsement]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Endorser',
      field: 'delegate',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp,
      sortable: false
    },
    {
      name: 'Slots',
      field: 'slots',
      sortable: false
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } }),
      sortable: false
    }
  ],

  [OperationTypes.Activation]: (options: { pageId: string; showFiatValue: boolean }) => [
    {
      name: 'Account',
      field: 'pkh',
      template: Template.address,
      data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true, pageId: options.pageId } }),
      sortable: false
    },
    {
      name: 'Secret',
      field: 'secret',
      sortable: false
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash }),
      sortable: false
    }
  ]
}
