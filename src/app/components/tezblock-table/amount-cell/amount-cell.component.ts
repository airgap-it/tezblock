import { Component } from '@angular/core'
import { Observable } from 'rxjs'

import { CryptoPricesService, CurrencyInfo } from '../../../services/crypto-prices/crypto-prices.service'

@Component({
  selector: 'app-amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss']
})
export class AmountCellComponent {
  public data: any // TODO: any
  public options: any = {
    // TODO: any
    showFiatValue: true
  }

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  constructor(private readonly cryptoPricesService: CryptoPricesService) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
  }
}
