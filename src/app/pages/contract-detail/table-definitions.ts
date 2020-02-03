import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'

export const columns: { [key: string]: (options: { pageId: string; showFiatValue: boolean; symbol: string }) => Column[] } = {
  [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean; symbol: string }) => [
    {
      name: 'From',
      field: 'singleFrom',
      width: '1',
      template: Template.address,
      data: (item: any) => ({ data: item.singleFrom, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: 'To',
      field: 'singleTo',
      width: '1',
      template: Template.address,
      data: (item: any) => ({ data: item.singleTo, options: { showFullAddress: false, pageId: options.pageId } })
    },
    {
      name: 'Amount',
      field: 'amount',
      template: Template.amount,
      data: (item: any) => ({ data: item.amount, options: { showFiatValue: options.showFiatValue, symbol: options.symbol } })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: any) => ({ data: item.fee, options: { showFiatValue: false, symbol: options.symbol } })
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash
    }
  ]
}
