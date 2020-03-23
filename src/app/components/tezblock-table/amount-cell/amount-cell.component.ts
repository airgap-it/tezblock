import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Observable, BehaviorSubject, Subject } from 'rxjs'
import * as moment from 'moment'
import { Store } from '@ngrx/store'

import { CurrencyInfo } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import BigNumber from 'bignumber.js'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import * as fromRoot from '@tezblock/reducers'

export interface AmountData {
  amount: number | string
  timestamp?: number
}

const dayDifference = (value: number): number => moment().diff(moment(value), 'days')

@Component({
  selector: 'amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss']
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
        this.setAmountPiped()
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

      if (this.amount) {
        this.setAmountPiped()
      }
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

  amountPipedLeadingChars: string
  amountPipedTrailingChars: string

  get fontColor(): boolean {
    return this.options.fontColor === undefined ? true : this.options.fontColor
  }

  get fontSmall(): boolean {
    return this.options.fontSmall === undefined ? true : this.options.fontSmall
  }

  get maxDigits(): number {
    return this.options.maxDigits === undefined ? 6 : this.options.maxDigits
  }

  showOldValue = false
  //showOldValue$ = new BehaviorSubject(false)

  constructor(
    private readonly amountConverterPipe: AmountConverterPipe,
    private readonly chartDataService: ChartDataService,
    private readonly store$: Store<fromRoot.State>
  ) {
    this.fiatCurrencyInfo$ = this.store$.select(state => state.app.fiatCurrencyInfo)
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

  private setAmountPiped() {
    const amountPiped = this.amountConverterPipe
      .transform(this.amount, {
        protocolIdentifier: 'xtz',
        maxDigits: this.maxDigits,
        fontSmall: this.fontSmall,
        fontColor: this.fontColor
      })
      .split('.')

    this.amountPipedLeadingChars = amountPiped[0]
    this.amountPipedTrailingChars = amountPiped[1]
  }
}
