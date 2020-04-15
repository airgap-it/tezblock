import { Component } from '@angular/core'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { Observable } from 'rxjs'
import { map, filter, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { $enum } from 'ts-enum-util'
import { Actions, ofType } from '@ngrx/effects'

import { MarketDataSample } from '../../services/chartdata/chartdata.service'
import { CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { TokenContract } from '@tezblock/domain/contract'
import { squareBrackets } from '@tezblock/domain/pattern'
import { PeriodTimespan, PeriodKind } from '@tezblock/domain/vote'
import { getRefresh } from '@tezblock/domain/synchronization'
import { BaseComponent } from '@tezblock/components/base.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Title } from '@angular/platform-browser'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent {
  blocks$: Observable<Block[]>
  transactions$: Observable<Transaction[]>
  currentCycle$: Observable<number>
  cycleProgress$: Observable<number>
  cycleStartingBlockLevel$: Observable<number>
  cycleEndingBlockLevel$: Observable<number>
  remainingTime$: Observable<string>

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
    private readonly actions$: Actions,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>,
    private titleService: Title
  ) {
    super()
    this.store$.dispatch(actions.loadContracts())
    this.store$.dispatch(actions.loadLatestProposal())

    this.contracts$ = this.store$.select(state => state.dashboard.contracts)
    this.bakers = Object.keys(accounts)
    this.blocks$ = this.store$.select(state => state.dashboard.blocks)
    this.transactions$ = this.store$.select(state => state.dashboard.transactions)

    this.currentCycle$ = this.store$.select(fromRoot.app.currentCycle)
    this.cycleProgress$ = this.store$.select(fromRoot.app.cycleProgress)
    this.cycleStartingBlockLevel$ = this.store$.select(fromRoot.app.cycleStartingBlockLevel)
    this.cycleEndingBlockLevel$ = this.store$.select(fromRoot.app.cycleEndingBlockLevel)
    this.remainingTime$ = this.store$.select(fromRoot.app.remainingTime)

    this.fiatInfo$ = this.store$.select(state => state.app.fiatCurrencyInfo)
    this.cryptoInfo$ = this.store$.select(state => state.app.cryptoCurrencyInfo)
    this.historicData$ = this.store$.select(state => state.app.cryptoHistoricData)
    this.percentage$ = this.store$.select(fromRoot.app.currencyGrowthPercentage)

    this.isMainnet()

    this.priceChartDatasets$ = this.historicData$.pipe(map(data => [{ data: data.map(dataItem => dataItem.open), label: 'Price' }]))
    this.priceChartLabels$ = this.historicData$.pipe(map(data => data.map(dataItem => new Date(dataItem.time * 1000).toLocaleTimeString())))
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

    this.subscriptions.push(
      getRefresh([
        this.actions$.pipe(ofType(actions.loadTransactionsSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsFailed))
      ]).subscribe(() => this.store$.dispatch(actions.loadTransactions())),

      getRefresh([
        this.actions$.pipe(ofType(actions.loadBlocksSucceeded)),
        this.actions$.pipe(ofType(actions.loadBlocksFailed))
      ]).subscribe(() => this.store$.dispatch(actions.loadBlocks()))
    )
    this.titleService.setTitle('tezblock - Tezos block explorer')
  }

  isMainnet() {
    const selectedNetwork = this.chainNetworkService.getNetwork()
    return selectedNetwork === TezosNetwork.MAINNET
  }
}
