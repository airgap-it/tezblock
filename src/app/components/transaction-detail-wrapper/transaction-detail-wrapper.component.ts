import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import BigNumber from 'bignumber.js'
import { CopyService } from 'src/app/services/copy/copy.service'

import { animate, state, style, transition, trigger } from '@angular/animations'
import { ToastrService } from 'ngx-toastr'
import { Observable } from 'rxjs'
import { Transaction } from 'src/app/interfaces/Transaction'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import { DayDifferenceService } from '@tezblock/services/day-difference/day-difference.service'

@Component({
  selector: 'transaction-detail-wrapper',
  templateUrl: './transaction-detail-wrapper.component.html',
  styleUrls: ['./transaction-detail-wrapper.component.scss'],
  animations: [
    trigger('changeBtnColor', [
      state(
        'copyTick',
        style({
          backgroundColor: 'lightgreen',
          backgroundImage: ''
        })
      ),
      transition('copyGrey =>copyTick', [animate(250, style({ transform: 'rotateY(360deg) scale(1.3)', backgroundColor: 'lightgreen' }))])
    ])
  ]
})
export class TransactionDetailWrapperComponent implements OnInit {
  public current = 'copyGrey'

  @Input()
  public latestTransaction$: Observable<Transaction> | undefined

  @Input()
  public blockConfirmations$: Observable<number> | undefined

  @Input()
  public amount$: Observable<BigNumber> | undefined

  @Input()
  public fee$: Observable<BigNumber> | undefined

  @Input()
  public loading$?: Observable<boolean>

  @Input()
  public fiatInfo$: Observable<CurrencyInfo> | undefined

  @Input()
  public isMainnet = true

  public historicFiatAmount = new Map<String, number>()

  public enableComparison = false

  public showOldValueVolume = false
  public showOldValueFee = false

  public tooltipClick(amount: number | BigNumber, kind: string) {
    this.latestTransaction$.subscribe((transaction: Transaction) => {
      const timestamp = transaction.timestamp

      const daysDifference = this.dayDifference(timestamp)
      if (daysDifference >= 1) {
        let date = new Date(timestamp)
        this.chartDataService.fetchHourlyMarketPrices(2, date, 'USD').then(response => {
          let oldValue = new BigNumber(response[1].close)
          amount = new BigNumber(amount)
          const result = amount.multipliedBy(oldValue).toNumber()
          this.historicFiatAmount.set(kind, result)
          if (kind === 'volume') {
            this.showOldValueVolume = !this.showOldValueVolume
          } else if (kind === 'fee') {
            this.showOldValueFee = !this.showOldValueFee
          }
        })
      }
    })
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly copyService: CopyService,
    private readonly toastrService: ToastrService,
    private readonly chartDataService: ChartDataService,
    private dayDifferenceService: DayDifferenceService
  ) {}

  public ngOnInit() {
    if (this.latestTransaction$) {
      this.latestTransaction$.subscribe((transaction: Transaction) => {
        const timestamp = transaction.timestamp
        const difference = this.dayDifference(timestamp)
        this.enableComparison = difference >= 1
      })
    }
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey'
    setTimeout(() => {
      this.current = 'copyGrey'
    }, 1500)
    this.toastrService.success('has been copied to clipboard', address)
  }

  public dayDifference(oldTimestamp: number): number {
    return this.dayDifferenceService.calcateDayDifference(oldTimestamp)
  }

  public getHistoricFiatAmount(key: string): number {
    return this.historicFiatAmount.get(key)
  }
}
