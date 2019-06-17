import { Pipe, PipeTransform } from '@angular/core'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'

@Pipe({
  name: 'currencySymbol',
  pure: true
})
export class CurrencySymbolPipe implements PipeTransform {
  public transform(value: number, args: { currInfo: CurrencyInfo }): string {
    return `${this.getSymbol(args.currInfo)}`
  }
  public getSymbol(currency: CurrencyInfo): string {
    return `${currency.symbol}`
  }
}
