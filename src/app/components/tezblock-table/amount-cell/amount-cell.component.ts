import { ChangeDetectorRef, Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { DecimalPipe } from '@angular/common'
import { Observable, BehaviorSubject, pipe } from 'rxjs'
import { switchMap, filter, map } from 'rxjs/operators'
import * as moment from 'moment'
import BigNumber from 'bignumber.js'

import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { CurrencyConverterPipe, CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { get } from '@tezblock/services/fp'
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'

const dayDifference = (value: number): number => moment().diff(moment(value), 'days')

@Component({
  selector: 'amount-cell',
  templateUrl: './amount-cell.component.html',
  styleUrls: ['./amount-cell.component.scss'],
  providers: [DecimalPipe]
})
export class AmountCellComponent implements OnInit {
  @Input()
  set data(value: number | string) {
    if (value !== this._data) {
      this._data = value

      if (value) {
        this.setAmountPiped()
      }
    }
  }
  get data(): number | string {
    return this._data
  }

  private _data: number | string

  @Input()
  set options(value: any) {
    if (value !== this._options) {
      this._options = value

      this.enableComparison = get<any>(v => dayDifference(v.comparisonTimestamp) >= 1)(value)
      if (this.data !== undefined) {
        this.setAmountPiped()
      }

      this.options$.next(value)
    }
  }

  get options() {
    return this._options === undefined ? { showFiatValue: true } : this._options
  }

  private _options = undefined

  historicAmount: string
  currencyAmount$: Observable<string>

  enableComparison = false

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

  private options$ = new BehaviorSubject<any>(null)

  constructor(
    private readonly amountConverterPipe: AmountConverterPipe,
    private readonly chartDataService: ChartDataService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly currencyConverterPipe: CurrencyConverterPipe,
    private readonly decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    this.currencyAmount$ = this.options$.pipe(
      switchMap(
        options => this.cryptoPricesService.getCurrencyConverterArgs(get<any>(_options => _options.symbol)(options)).pipe(
          filter(currencyConverterArgs => currencyConverterArgs && this.data !== undefined),
          map(this.getFormattedCurremcy.bind(this))
        )
      )
    )
  }

  tooltipClick() {
    if (this.enableComparison) {
      const date = new Date(this.options.comparisonTimestamp)
      this.chartDataService.fetchHourlyMarketPrices(2, date, 'USD').then(response => {
        const currInfo = {
          symbol: '$',
          currency: 'USD',
          price: new BigNumber(response[1].close)
        }
        this.historicAmount = this.getFormattedCurremcy({ currInfo, protocolIdentifier: 'xtz' })
        this.cdRef.markForCheck()

        this.showOldValue = !this.showOldValue
      })
    }
  }

  private setAmountPiped() {
    const protocolIdentifier = get<any>(o => o.symbol)(this.options) || 'xtz'
    const converted = this.amountConverterPipe.transform(this.data || 0, {
      protocolIdentifier,
      maxDigits: this.maxDigits
    })
    const decimals = pipe<string, number, string>(
      stringNumber => parseFloat(stringNumber.replace(',', '')),
      numericValue => this.decimalPipe.transform(numericValue, this.getPrecision(converted)).split('.')[1]
    )(converted)

    this.amountPipedLeadingChars = converted.split('.')[0]
    this.amountPipedTrailingChars = decimals
  }

  private getPrecision(value: string): string {
    const numericValue = parseFloat(value.replace(',', ''))

    if (numericValue < 1) {
      return '1.2-8'
    }

    if (numericValue >= 1000) {
      return '1.0-0'
    }

    return '1.2-2'
  }

  private getFormattedCurremcy(args: CurrencyConverterPipeArgs): string {
    if (this.data === undefined) {
      return undefined
    }

    const converted = this.currencyConverterPipe.transform(this.data || 0, args)

    return this.decimalPipe.transform(converted, this.getPrecision(converted.toString()))
  }
}
