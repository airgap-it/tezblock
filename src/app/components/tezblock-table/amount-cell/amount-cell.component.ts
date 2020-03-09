import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Observable, BehaviorSubject, Subject } from 'rxjs'
import * as moment from 'moment'

import { CryptoPricesService, CurrencyInfo } from '../../../services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import BigNumber from 'bignumber.js'

export interface AmountData {
  amount: number | string
  timestamp?: number
}

const dayDifference = (value: number): number => moment().diff(moment(value), 'days')

@Component({
  selector: 'amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss'],
  // TODO: on 1st click no change
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountCellComponent implements OnInit {
  @Input()
  set data(value: AmountData) {
    if (value !== this._data) {
      this._data = value

      if (value) {
        this.enableComparison = dayDifference(this.data.timestamp) >= 1
        this.amount = this.data.amount || 0
      }
    }
  }
  get data(): AmountData {
    return this._data
  }

  private _data: AmountData

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

  fiatCurrencyInfo$: Observable<CurrencyInfo>

  historicCurrencyInfo: CurrencyInfo
  //historicCurrencyInfo$ = new Subject()

  enableComparison = false

  amount: number | BigNumber | string

  showOldValue = false
  //showOldValue$ = new BehaviorSubject(false)

  constructor(private readonly cryptoPricesService: CryptoPricesService, private readonly chartDataService: ChartDataService) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
  }

  ngOnInit() {}

  tooltipClick() {
    if (dayDifference(this.data.timestamp) >= 1) {
      const date = new Date(this.data.timestamp)

      this.chartDataService.fetchHourlyMarketPrices(2, date, 'USD').then(response => {
        this.historicCurrencyInfo = {
          symbol: '$',
          currency: 'USD',
          price: new BigNumber(response[1].close)
        }
        this.showOldValue = !this.showOldValue
      })
    }
  }
}
