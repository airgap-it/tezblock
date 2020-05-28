import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { TokenContract } from '@tezblock/domain/contract'
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
        data: item.totalSupply,
        options: { symbol: item.symbol, showFiatValue: isConvertableToUSD(item.symbol) }
      })
    },
    {
      name: 'Description',
      field: 'description'
    }
  ]
