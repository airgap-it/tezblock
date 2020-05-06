import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { getConventer, TokenContract } from '@tezblock/domain/contract'
import { isConvertableToUSD } from '@tezblock/domain/airgap'

export const columns = (): Column[] => [
    {
      name: 'Asset',
      field: 'id',
      template: Template.address
    },
    {
      name: 'Contract Address',
      field: 'id',
      template: Template.address,
      data: (item: any) => ({ data: item.id, options: { showFullAddress: true, forceIdenticon: true } })
    },
    // {
    //   name: 'Symbol',
    //   field: 'symbol'
    // },
    {
      name: 'Total Supply',
      field: 'totalSupply',
      template: Template.amount,
      data: (item: TokenContract) => ({
        data: { amount: item.totalSupply },
        options: { symbol: item.symbol, conventer: getConventer(item), showFiatValue: isConvertableToUSD(item.symbol) }
      })
    },
    {
      name: 'Description',
      field: 'description'
    }
  ]
