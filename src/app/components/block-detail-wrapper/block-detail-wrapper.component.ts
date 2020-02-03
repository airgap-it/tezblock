import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { Block } from 'src/app/interfaces/Block'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service'
import BigNumber from 'bignumber.js'

@Component({
  selector: 'block-detail-wrapper',
  templateUrl: './block-detail-wrapper.component.html',
  styleUrls: ['./block-detail-wrapper.component.scss']
})
export class BlockDetailWrapperComponent implements OnInit {
  public isCollapsed = true

  @Input()
  public wrapperBlock$: Observable<Block> | undefined

  @Input()
  public fiatInfo$: Observable<CurrencyInfo> | undefined

  @Input()
  public endorsements$: Observable<number> | undefined

  @Input()
  public confirmations$: Observable<number> | undefined

  @Input()
  public blockLoading$: Observable<boolean> | undefined

  @Input()
  public isMainnet: boolean = true

  public historicFiatAmount = new Map<String, number>()

  public enableComparison: boolean = false

  public showOldValueVolume: boolean = false
  public showOldValueFee: boolean = false

  public tooltipClick(amount, kind) {
    this.wrapperBlock$.subscribe((block: Block) => {
      const timestamp = block.timestamp

      let daysDifference = this.dayDifference(timestamp)
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

  constructor(private readonly route: ActivatedRoute, private readonly chartDataService: ChartDataService) {}

  public ngOnInit() {
    if (this.wrapperBlock$) {
      this.wrapperBlock$.subscribe((block: Block) => {
        const timestamp = block.timestamp
        const difference = this.dayDifference(timestamp)
        this.enableComparison = difference >= 1
      })
    }
  }

  public dayDifference(oldTimestamp): number {
    let currentTimestamp = +new Date()
    const difference = currentTimestamp - oldTimestamp
    const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)

    return daysDifference
  }

  public getHistoricFiatAmount(key: string): number {
    return this.historicFiatAmount.get(key)
  }
}
