import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { CryptoPricesService, CurrencyInfo } from '../../../services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import BigNumber from 'bignumber.js'
import { ApiService } from '@tezblock/services/api/api.service'

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

  @Input() showFee: boolean = false

  @Input() fromBlock?: boolean = false

  get options() {
    return this._options === undefined ? { showFiatValue: true } : this._options
  }

  private _options = undefined

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public historicFiatAmount: number

  public enableComparison: boolean = false

  public amount: number | BigNumber

  public tooltipClick() {
    let daysDifference = this.dayDifference(this.data.timestamp)
    if (daysDifference >= 1) {
      let date = new Date(this.data.timestamp)
      this.chartDataService.fetchHourlyMarketPrices(2, date, 'USD').then(response => {
        let oldValue = new BigNumber(response[1].close)
        if (this.showFee) {
          this.amount = new BigNumber(this.data.fee)
        } else {
          this.amount = new BigNumber(this.amount)
        }

        this.historicFiatAmount = this.amount.multipliedBy(oldValue).toNumber()
        this.showOldValue = !this.showOldValue
      })
    }
  }
  public showOldValue: boolean = false

  constructor(
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly chartDataService: ChartDataService,
    private apiService: ApiService
  ) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
  }

  public dayDifference(oldTimestamp: number): number {
    return this.apiService.calcateDayDifference(oldTimestamp)
  }

  ngOnInit(): void {
    if (this.data) {
      const difference = this.dayDifference(this.data.timestamp)
      this.enableComparison = difference >= 1
      if (this.fromBlock) {
        this.amount = this.data.volume
      } else if (this.showFee) {
        this.amount = this.data.fee
      } else {
        this.amount = this.data.amount
      }
    }
  }
}
