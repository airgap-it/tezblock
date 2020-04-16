import { ChangeDetectorRef, Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import * as moment from 'moment'
import { Store } from '@ngrx/store'
import BigNumber from 'bignumber.js'

import { CurrencyInfo } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import * as fromRoot from '@tezblock/reducers'
import { get } from '@tezblock/services/fp'
import { isInBTC } from '@tezblock/domain/airgap'
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'

export interface AmountData {
  amount: number | string
  timestamp?: number
}

export type Conventer = (amount: any) => string

const dayDifference = (value: number): number => moment().diff(moment(value), 'days')

@Component({
  selector: 'amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss']
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

      this.options$.next(value)
    }
  }

  get options() {
    return this._options === undefined ? { showFiatValue: true } : this._options
  }

  get conventer(): Conventer {
    return this.options.conventer || this.defaultConventer.bind(this)
  }
  currencyConverterPipeArgs$: Observable<CurrencyConverterPipeArgs>

  private _options = undefined

  fiatCurrencyInfo$: Observable<CurrencyInfo>

  historicCurrencyInfo: CurrencyInfo

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

  // temporary solution: ask how to utilizy existing maxDigits but doesn't used by fiatValue
  get precision(): number {
    return isInBTC(get<any>(options => options.symbol)(this.options)) ? 8 : 2
  }

  showOldValue = false

  private options$ = new BehaviorSubject<any>(null)

  constructor(
    private readonly amountConverterPipe: AmountConverterPipe,
    private readonly chartDataService: ChartDataService,
    private cdRef: ChangeDetectorRef,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly store$: Store<fromRoot.State>
  ) {}

  ngOnInit() {
    this.fiatCurrencyInfo$ = this.store$.select(state => state.app.fiatCurrencyInfo)

    // TODO: this is bad: for a split of a second always is visible fiatCurrencyInfo$ conversion
    this.currencyConverterPipeArgs$ = this.options$.pipe(
      switchMap(options => this.cryptoPricesService.getCurrencyConverterArgs(get<any>(_options => _options.symbol)(options)))
    )
  }

  tooltipClick() {
    if (dayDifference(this.data.timestamp) >= 1) {
      const date = new Date(this.data.timestamp)
      this.chartDataService.fetchHourlyMarketPrices(2, date, 'USD').then(response => {
        this.historicCurrencyInfo = {
          symbol: '$',
          currency: 'USD',
          price: new BigNumber(response[1].close)
        }
        this.cdRef.markForCheck()

        this.showOldValue = !this.showOldValue
      })
    }
  }

  private setAmountPiped() {
    const amountPiped = this.conventer(this.amount).split('.')

    this.amountPipedLeadingChars = amountPiped[0]
    this.amountPipedTrailingChars = amountPiped[1]
  }

  private defaultConventer(amount: any): string {
    return this.amountConverterPipe.transform(amount, {
      protocolIdentifier: 'xtz',
      maxDigits: this.maxDigits,
      fontSmall: this.fontSmall,
      fontColor: this.fontColor
    })
  }
}
