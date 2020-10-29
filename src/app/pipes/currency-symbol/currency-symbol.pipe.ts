import { Pipe, PipeTransform } from '@angular/core'
import { get } from 'lodash'

@Pipe({
  name: 'currencySymbol',
  pure: true
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(value: any, args: { currInfo: { symbol: string } }): string {
    return `${get(args, 'currInfo.symbol') || ''}`
  }
}
