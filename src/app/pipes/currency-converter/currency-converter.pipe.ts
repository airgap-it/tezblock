import { Pipe, PipeTransform } from '@angular/core'
import { BigNumber } from 'bignumber.js'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'
import { tryGetProtocolByIdentifier } from '@tezblock/domain/airgap'

export interface CurrencyConverterPipeArgs {
  currInfo: CurrencyInfo
  protocolIdentifier: string
}

@Pipe({
  name: 'currencyConverter',
  pure: true
})
export class CurrencyConverterPipe implements PipeTransform {
  public transform(value: string | number | BigNumber, args?: CurrencyConverterPipeArgs): number {
    if (!BigNumber.isBigNumber(value)) {
      value = new BigNumber(value)
    }

    if (!args) {
      return null
    }

    const protocol: { decimals: number } = tryGetProtocolByIdentifier(args.protocolIdentifier) || { decimals: 0 }

    const BN = BigNumber.clone({
      FORMAT: {
        decimalSeparator: `.`,
        groupSeparator: `'`,
        groupSize: 3
      }
    })
    const amount = new BN(value).shiftedBy(protocol.decimals * -1)

    return this.transformToCurrency(amount, args.currInfo)
    /*
    args ? result = this.transformToCurrency(amount, args.currInfo) : result = value.toNumber() */
  }
  public transformToCurrency(val: BigNumber, currency: CurrencyInfo): number {
    return val.multipliedBy(currency.price).toNumber()
  }
}
