import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { CryptoPricesService, CurrencyInfo } from '../../../services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import BigNumber from 'bignumber.js'

@Component({
  selector: 'amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss']
})
export class AmountCellComponent implements OnInit {
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

  public historicFiatAmount: number

  public enableComparison: boolean = false

  public tooltipClick() {
    let daysDifference = this.dayDifference(this.data.timestamp)
    if (daysDifference >= 1) {
      let date = new Date(this.data.timestamp)
      this.chartDataService.fetchHourlyMarketPrices(2, date, 'USD').then(response => {
        let oldValue = new BigNumber(response[1].close)
        const amount = new BigNumber(this.data.amount)
        this.historicFiatAmount = amount.multipliedBy(oldValue).toNumber()
        this.showOldValue = !this.showOldValue
      })
    }
  }
  public showOldValue: boolean = false

  constructor(private readonly cryptoPricesService: CryptoPricesService, private readonly chartDataService: ChartDataService) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
  }

  public dayDifference(oldTimestamp): number {
    let currentTimestamp = +new Date()
    const difference = currentTimestamp - oldTimestamp
    const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)

    return daysDifference
  }

  ngOnInit(): void {
    if (this.data) {
      const difference = this.dayDifference(this.data.timestamp)
      this.enableComparison = difference >= 1
    }
  }
}
