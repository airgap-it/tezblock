import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { TokenContract } from '@tezblock/domain/contract'
import { isConvertableToUSD } from '@tezblock/domain/airgap'
import { TranslateService } from '@ngx-translate/core'

export const columns = (translate: TranslateService): Column[] => [
  {
    name: translate.instant('tezblock-table.token-contract.asset'),
    field: 'id',
    template: Template.address
  },
  {
    name: translate.instant('tezblock-table.token-contract.contract-address'),
    field: 'id',
    template: Template.address,
    data: (item: any) => ({ data: item.id, options: { showFullAddress: true, forceIdenticon: true } })
  },
  // {
  //   name: 'Symbol',
  //   field: 'symbol'
  // },
  {
    name: translate.instant('tezblock-table.token-contract.total-supply'),
    field: 'totalSupply',
    template: Template.amount,
    data: (item: TokenContract) => ({
      data: item.totalSupply,
      options: { symbol: item.symbol, showFiatValue: isConvertableToUSD(item.symbol) }
    })
  },
  {
    name: translate.instant('tezblock-table.token-contract.description'),
    field: 'description'
  }
]
