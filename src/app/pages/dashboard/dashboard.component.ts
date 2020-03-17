import { Component } from '@angular/core'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { Observable, Subscription } from 'rxjs'
import { map, filter, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { $enum } from 'ts-enum-util'

import { BlockService } from '../../services/blocks/blocks.service'
import { MarketDataSample } from '../../services/chartdata/chartdata.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { CycleService } from '../../services/cycle/cycle.service'
import { TransactionService } from '../../services/transaction/transaction.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { TokenContract } from '@tezblock/domain/contract'
import { squareBrackets } from '@tezblock/domain/pattern'
import { PeriodTimespan, PeriodKind } from '@tezblock/domain/vote'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  blocks$: Observable<Object>
  transactions$: Observable<Object>
  currentCycle$: Observable<number>
  cycleProgress$: Observable<number>
  cycleStartingBlockLevel$: Observable<number>
  cycleEndingBlockLevel$: Observable<number>
  remainingTime$: Observable<string>
  subscription: Subscription

  fiatInfo$: Observable<CurrencyInfo>
  cryptoInfo$: Observable<CurrencyInfo>
  percentage$: Observable<number>
  historicData$: Observable<MarketDataSample[]>

  bakers: string[]

  priceChartDatasets$: Observable<{ data: number[]; label: string }[]>
  priceChartLabels$: Observable<string[]>
  contracts$: Observable<TokenContract[]>
  proposalHash$: Observable<string>
  currentPeriodTimespan$: Observable<PeriodTimespan>
  currentPeriodKind$: Observable<string>
  currentPeriodIndex$: Observable<number>

  constructor(
    private readonly blocksService: BlockService,
    private readonly transactionService: TransactionService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly cycleService: CycleService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>
  ) {
    this.store$.dispatch(actions.loadContracts())
    this.store$.dispatch(actions.loadLatestProposal())

    this.contracts$ = this.store$.select(state => state.dashboard.contracts)
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

    this.priceChartDatasets$ = this.cryptoPricesService.historicData$.pipe(
      map(data => [{ data: data.map(dataItem => dataItem.open), label: 'Price' }])
    )
    this.priceChartLabels$ = this.cryptoPricesService.historicData$.pipe(
      map(data => data.map(dataItem => new Date(dataItem.time * 1000).toLocaleTimeString()))
    )
    this.proposalHash$ = this.store$
      .select(state => state.dashboard.proposal)
      .pipe(
        withLatestFrom(this.store$.select(state => state.app.currentVotingPeriod)),
        filter(([proposal, currentVotingPeriod]) => !!proposal && !!currentVotingPeriod),
        map(([proposal, currentVotingPeriod]) =>
          proposal.period === currentVotingPeriod ? proposal.proposal.replace(squareBrackets, '') : null
        )
      )
    this.currentPeriodTimespan$ = this.store$.select(state => state.dashboard.currentPeriodTimespan)
    this.currentPeriodKind$ = this.store$
      .select(state => state.app.latestBlock)
      .pipe(
        filter(latestBlock => !!latestBlock),
        map(latestBlock => $enum(PeriodKind).getKeyOrThrow(latestBlock.period_kind))
      )
    this.currentPeriodIndex$ = this.store$
      .select(state => state.app.latestBlock)
      .pipe(
        filter(latestBlock => !!latestBlock),
        map(latestBlock => $enum(PeriodKind).indexOfValue(<PeriodKind>latestBlock.period_kind) + 1)
      )
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  isMainnet() {
    const selectedNetwork = this.chainNetworkService.getNetwork()
    return selectedNetwork === TezosNetwork.MAINNET
  }
}
