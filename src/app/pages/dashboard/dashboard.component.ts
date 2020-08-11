import { Component, OnInit } from '@angular/core'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { combineLatest, BehaviorSubject, Observable } from 'rxjs'
import { map, filter, withLatestFrom, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { $enum } from 'ts-enum-util'
import { Actions, ofType } from '@ngrx/effects'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'

import { CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import * as appActions from '@tezblock/app.actions'
import { TokenContract } from '@tezblock/domain/contract'
import { squareBrackets } from '@tezblock/domain/pattern'
import { PeriodTimespan, PeriodKind } from '@tezblock/domain/vote'
import { getRefresh } from '@tezblock/domain/synchronization'
import { BaseComponent } from '@tezblock/components/base.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Title, Meta } from '@angular/platform-browser'
import { PricePeriod } from '@tezblock/services/crypto-prices/crypto-prices.service'

const accounts = require('src/submodules/tezos_assets/accounts.json')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit {
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
  pricePeriod$ = new BehaviorSubject<number>(PricePeriod.day)

  yayRolls$: Observable<number>
  nayRolls$: Observable<number>
  passRolls$: Observable<number>
  yayRollsPercentage$: Observable<number>
  nayRollsPercentage$: Observable<number>
  showRolls$: Observable<boolean>

  constructor(
    private readonly actions$: Actions,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>,
    private titleService: Title,
    private metaTagService: Meta
  ) {
    super()
  }

  ngOnInit() {
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
    this.historicData$ = this.store$.select(state => state.dashboard.cryptoHistoricData)
    this.percentage$ = this.store$.select(fromRoot.dashboard.currencyGrowthPercentage)

    this.priceChartDatasets$ = this.historicData$.pipe(map(data => [{ data: data.map(dataItem => dataItem.open), label: 'Price' }]))
    this.priceChartLabels$ = this.pricePeriod$.pipe(
      switchMap(pricePeriod =>
        this.historicData$.pipe(
          map(data =>
            data.map(dataItem =>
              pricePeriod === PricePeriod.day
                ? new Date(dataItem.time * 1000).toLocaleTimeString()
                : new Date(dataItem.time * 1000).toLocaleDateString()
            )
          )
        )
      )
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

    this.yayRolls$ = this.store$.select(fromRoot.dashboard.yayRolls)
    this.nayRolls$ = this.store$.select(fromRoot.dashboard.nayRolls)
    this.passRolls$ = this.store$.select(fromRoot.dashboard.passRolls)
    this.yayRollsPercentage$ = this.store$.select(fromRoot.dashboard.yayRollsPercentage)
    this.nayRollsPercentage$ = this.store$.select(fromRoot.dashboard.nayRollsPercentage)
    this.showRolls$ = combineLatest(
      this.store$.select(state => state.app.latestBlock),
      this.yayRolls$
    ).pipe(
      map(
        ([latestBlock, yayRolls]) =>
          latestBlock &&
          [<string>PeriodKind.Exploration, <string>PeriodKind.Promotion].indexOf(latestBlock.period_kind) !== -1 &&
          yayRolls !== undefined
      )
    )

    this.subscriptions.push(
      getRefresh([
        this.actions$.pipe(ofType(actions.loadTransactionsSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsFailed))
      ]).subscribe(() => this.store$.dispatch(actions.loadTransactions())),

      getRefresh([
        this.actions$.pipe(ofType(actions.loadBlocksSucceeded)),
        this.actions$.pipe(ofType(actions.loadBlocksFailed))
      ]).subscribe(() => this.store$.dispatch(actions.loadBlocks())),

      this.pricePeriod$
        .pipe(
          switchMap(periodIndex =>
            getRefresh([
              this.actions$.pipe(ofType(actions.loadCryptoHistoricDataSucceeded)),
              this.actions$.pipe(ofType(actions.loadCryptoHistoricDataFailed))
            ]).pipe(map(() => periodIndex))
          )
        )
        .subscribe(periodIndex => this.store$.dispatch(actions.loadCryptoHistoricData({ periodIndex }))),

      this.actions$
        .pipe(ofType(appActions.loadPeriodInfosSucceeded))
        .subscribe(() => this.store$.dispatch(actions.loadCurrentPeriodTimespan())),

      this.contracts$
        .pipe(
          filter(data => Array.isArray(data) && data.some(item => ['tzBTC', 'BTC'].includes(item.symbol))),
          switchMap(() =>
            getRefresh([
              this.actions$.pipe(ofType(appActions.loadExchangeRateSucceeded)),
              this.actions$.pipe(ofType(appActions.loadExchangeRateFailed))
            ])
          )
        )
        .subscribe(() => this.store$.dispatch(appActions.loadExchangeRate({ from: 'BTC', to: 'USD' }))),

      this.actions$
        .pipe(
          ofType(appActions.loadPeriodInfosSucceeded),
          switchMap(() =>
            getRefresh([
              this.actions$.pipe(ofType(actions.loadDivisionOfVotesSucceeded)),
              this.actions$.pipe(ofType(actions.loadDivisionOfVotesFailed))
            ])
          )
        )
        .subscribe(() => this.store$.dispatch(actions.loadDivisionOfVotes()))
    )
    this.titleService.setTitle(`tezblock - Tezos block explorer`)
    this.metaTagService.updateTag({
      name: 'description',
      content:
        'tezblock is a block explorer built by AirGap for Tezos an open-source platform for assets and applications backed by a global community of validators, researchers, and builders.'
    })
  }

  isMainnet() {
    const selectedNetwork = this.chainNetworkService.getNetwork()

    return selectedNetwork === TezosNetwork.MAINNET
  }

  changePricePeriod(periodIndex: number) {
    this.pricePeriod$.next(periodIndex)
  }
}
