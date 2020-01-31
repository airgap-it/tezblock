import { Component, Input } from '@angular/core'
import { Observable } from 'rxjs'

import { CryptoPricesService, CurrencyInfo } from '../../../services/crypto-prices/crypto-prices.service'

@Component({
  selector: 'amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss']
})
export class AmountCellComponent {
  @Input() data: any

  @Input()
  set options(value: any) {
    if (value !== this._options) {
      this._options = value
    }
  }

  get options() {
    return this._options === undefined ? { showFiatValue: true } : this._options
  }

  private _options = undefined

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public tooltipClick() {
    this.showOldValue = !this.showOldValue
  }
  public showOldValue: boolean = false

  constructor(private readonly cryptoPricesService: CryptoPricesService) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
  }
}
