import { Component } from '@angular/core'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { Observable, Subscription } from 'rxjs'

import { BlockService } from '../../services/blocks/blocks.service'
import { MarketDataSample } from '../../services/chartdata/chartdata.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { CycleService } from '../../services/cycle/cycle.service'
import { TransactionService } from '../../services/transaction/transaction.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
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
    private readonly blocksService: BlockService,
    private readonly transactionService: TransactionService,
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
    this.isMainnet()
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  public isMainnet() {
    const selectedNetwork = this.chainNetworkService.getNetwork()
    return selectedNetwork === TezosNetwork.MAINNET
  }
}
