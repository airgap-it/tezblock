import { Pipe, PipeTransform } from '@angular/core'
import { getProtocolByIdentifier } from 'airgap-coin-lib'
import { BigNumber } from 'bignumber.js'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'

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

    let protocol

    try {
      if (args) {
        protocol = getProtocolByIdentifier(args.protocolIdentifier)
      } else {
        return 0
      }
    } catch (e) {
      return 0
    }

    const BN = BigNumber.clone({
      FORMAT: {
        decimalSeparator: `.`,
        groupSeparator: `'`,
        groupSize: 3
      }
    })
    const amount = new BN(value).shiftedBy(protocol.decimals * -1)
    const result: number = args ? this.transformToCurrency(amount, args.currInfo) : value.toNumber()
    return result
    /*
    args ? result = this.transformToCurrency(amount, args.currInfo) : result = value.toNumber() */
  }
  public transformToCurrency(val: BigNumber, currency: CurrencyInfo): number {
    return val.multipliedBy(currency.price).toNumber()
  }
}
