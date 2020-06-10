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

export interface AmountOptions {
  showFiatValue?: boolean
  symbol?: string
  comparisonTimestamp?: number
  maxDigits?: number
  digitsInfo?: string
  fontColor?: boolean
  fontSmall?: boolean
}

export const getPrecision = (value: string | number, options?: AmountOptions): string => {
  const numericValue: number = typeof value === 'string' ? parseFloat(value.replace(',', '')) : value
  const digitsInfo: string = get<AmountOptions>(o => o.digitsInfo)(options)
  const hasDecimals = numericValue - Math.floor(numericValue) !== 0

  // this case overrides options.decimals
  if (numericValue === 0 || !hasDecimals) {
    return '1.0-0'
  }

  if (digitsInfo) {
    return digitsInfo
  }

  if (numericValue >= 1000) {
    return '1.0-0'
  }

  if (numericValue < 1) {
    return '1.2-8'
  }

  return '1.2-2'
}

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
  set options(value: AmountOptions) {
    if (value !== this._options) {
      this._options = value

      this.enableComparison = get<AmountOptions>(v => dayDifference(v.comparisonTimestamp) >= 1)(value)
      if (this.data !== undefined) {
        this.setAmountPiped()
      }

      this.options$.next(value)
    }
  }

  get options() {
    return this._options === undefined ? { showFiatValue: true } : this._options
  }

  private _options: AmountOptions

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
      switchMap(options =>
        this.cryptoPricesService.getCurrencyConverterArgs(get<any>(_options => _options.symbol)(options)).pipe(
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
    const converted: string =
      this.amountConverterPipe.transform(this.data || 0, {
        protocolIdentifier,
        maxDigits: this.maxDigits
      }) || '0'
    const decimals = pipe<string, number, string>(
      stringNumber => parseFloat(stringNumber.replace(',', '')),
      pipe(
        numericValue => this.decimalPipe.transform(numericValue, getPrecision(converted)),
        decimalPiped => (decimalPiped ? decimalPiped.split('.')[1] : decimalPiped)
      )
    )(converted)

    this.amountPipedLeadingChars = converted.split('.')[0]
    this.amountPipedTrailingChars = decimals
  }

  private getFormattedCurremcy(args: CurrencyConverterPipeArgs): string {
    if (this.data === undefined) {
      return undefined
    }

    const converted = this.currencyConverterPipe.transform(this.data || 0, args)

    return this.decimalPipe.transform(converted, getPrecision(converted, this.options))
  }
}
