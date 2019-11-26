import { Component } from '@angular/core'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { Observable, race, Subscription } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import { BlockService } from '../../services/blocks/blocks.service'
import { MarketDataSample } from '../../services/chartdata/chartdata.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { CycleService } from '../../services/cycle/cycle.service'
import { SearchService } from '../../services/search/search.service'

import { TypeAheadObject } from './../../interfaces/TypeAheadObject'
import { ApiService } from './../../services/api/api.service'
import { TransactionService } from './../../services/transaction /transaction.service'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  public dataSource: Observable<any> // TODO: any

  public searchTerm: string = ''

  public blocks$: Observable<Object>
  public transactions$: Observable<Object>
  public currentCycle$: Observable<number>
  public cycleProgress$: Observable<number>
  public cycleStartingBlockLevel$: Observable<number>
  public cycleEndingBlockLevel$: Observable<number>
  public remainingTime$: Observable<string>
  public subscription: Subscription

  public fiatInfo$: Observable<CurrencyInfo>
  public cryptoInfo$: Observable<CurrencyInfo>
  public percentage$: Observable<number>
  public historicData$: Observable<MarketDataSample[]>

  public bakers: string[]

  constructor(
    public readonly searchService: SearchService,
    private readonly blocksService: BlockService,
    private readonly transactionService: TransactionService,
    private readonly apiService: ApiService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly cycleService: CycleService,
    private readonly chainNetworkService: ChainNetworkService
  ) {
    this.bakers = Object.keys(accounts)
    this.blocks$ = this.blocksService.list$

    this.transactions$ = this.transactionService.list$

    this.currentCycle$ = this.cycleService.currentCycle$
    this.cycleProgress$ = this.cycleService.cycleProgress$
    this.cycleStartingBlockLevel$ = this.cycleService.cycleStartingBlockLevel$
    this.cycleEndingBlockLevel$ = this.cycleService.cycleEndingBlockLevel$
    this.remainingTime$ = this.cycleService.remainingTime$

    this.fiatInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.cryptoInfo$ = this.cryptoPricesService.cryptoCurrencyInfo$
    this.historicData$ = this.cryptoPricesService.historicData$
    this.percentage$ = this.cryptoPricesService.growthPercentage$

    this.transactionService.setPageSize(6)
    this.blocksService.setPageSize(6)
    this.dataSource = new Observable<string>((observer: any) => {
      observer.next(this.searchTerm)
    }).pipe(
      mergeMap(token =>
        race(
          this.apiService.getTransactionHashesStartingWith(token),
          this.apiService.getAccountsStartingWith(token),
          this.apiService.getBlockHashesStartingWith(token)
        )
      )
    )
    this.isMainnet()
  }

  public onKeyEnter(searchTerm: string) {
    this.subscription = this.dataSource.subscribe((val: TypeAheadObject[]) => {
      if (val.length > 0 && val[0].name !== searchTerm) {
        // there are typeahead suggestions. upon hitting enter, we first autocomplete the suggestion
        return
      } else {
        this.searchService.search(searchTerm)
      }
    })
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  public isMainnet() {
    const selectedNetwork = this.chainNetworkService.getEnvironmentVariable()
    if (selectedNetwork === 'mainnet') {
      return false
    } else {
      return true
    }
  }
}
