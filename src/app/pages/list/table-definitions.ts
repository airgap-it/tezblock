import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'

export const columns: { [key: string]: (pageId?: string) => Column[] } = {
  [OperationTypes.Block]: () => [
    {
      name: 'Baker',
      field: 'baker',
      width: '1',
      template: Template.address
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp
    },
    {
      name: 'Transaction Volume',
      field: 'volume',
      template: Template.amount
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Block) => ({ data: item.fee, options: { showFiatValue: false } })
    },
    {
      name: 'Transactions',
      field: 'txcount'
    },
    {
      name: 'Fitness',
      field: 'fitness'
    },
    {
      name: 'Block',
      field: 'level',
      template: Template.block
    }
  ],

  [OperationTypes.Transaction]: () =>
    [
      {
        name: 'From',
        field: 'source',
        width: '1',
        template: Template.address
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
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.amount, options: { showFiatValue: true } })
      },
      {
        name: 'Fees',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
      },
      {
        name: 'Parameters',
        field: 'parameters',
        template: Template.modal
      }
    ].concat(<any>blockAndTxHashColumns),

  [OperationTypes.Activation]: () =>
    [
      {
        name: 'Account',
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true } })
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

  [OperationTypes.Origination]: () => [
    {
      name: 'New Account',
      field: 'originated_contracts',
      width: '1',
      template: Template.address
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp
    },
    {
      name: 'Balance',
      field: 'originatedBalance',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.originatedBalance, options: { showFiatValue: true } })
    },
    {
      name: 'Originator',
      field: 'source',
      width: '1',
      template: Template.address
    },
    {
      name: 'Baker',
      field: 'delegate',
      width: '1',
      template: Template.address,
      data: (item: Transaction) => ({
        data: item.delegate || 'undelegate',
        options: { showFullAddress: false, isText: item.delegate ? undefined : true }
      })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
    }
  ].concat(<any>blockAndTxHashColumns),

  
}
