import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
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
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit'
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash })
    }
  ],

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
      name: 'Amount',
      field: 'delegatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.delegatedBalance, options })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
    },
    {
      name: 'Gas Limit',
      field: 'gas_limit'
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: any) => ({ data: item.operation_group_hash })
    }
  ],

  [OperationTypes.Origination]: (options: { pageId: string, showFiatValue: boolean }) => [
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
        data: (item: Transaction) => ({ data: item.originatedBalance, options })
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
        data: (item: Transaction) => ({ data: item.fee, options })
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
        name: 'Tx Hash',
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: any) => ({ data: item.operation_group_hash })
      }
  ],

  [OperationTypes.Endorsement]: (options: { pageId: string, showFiatValue: boolean }) => [
    {
        name: 'Endorser',
        field: 'delegate',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } })
      },
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
        name: 'Tx Hash',
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
      }
  ],

  [OperationTypes.Activation]: (options: { pageId: string, showFiatValue: boolean }) => [
    {
        name: 'Account',
        field: 'pkh',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true, pageId: options.pageId } })
      },
      {
        name: 'Secret',
        field: 'secret'
      },
      {
        name: 'Tx Hash',
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.operation_group_hash })
      }
  ]
}
