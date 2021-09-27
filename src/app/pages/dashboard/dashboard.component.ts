import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { $enum } from 'ts-enum-util';

import { Meta, Title } from '@angular/platform-browser';
import * as appActions from '@tezblock/app.actions';
import { BaseComponent } from '@tezblock/components/base.component';
import { jsonAccounts } from '@tezblock/domain/account';
import { TokenContract } from '@tezblock/domain/contract';
import { getRefresh } from '@tezblock/domain/synchronization';
import { PeriodKind, PeriodTimespan } from '@tezblock/domain/vote';
import { Block } from '@tezblock/interfaces/Block';
import { Transaction } from '@tezblock/interfaces/Transaction';
import * as fromRoot from '@tezblock/reducers';
import { PricePeriod } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service';
import * as actions from './actions';
import { TezosNetwork } from '@airgap/coinlib-core';
import { MarketDataSample } from '@tezblock/services/crypto-prices/crypto-prices.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends BaseComponent implements OnInit {
  public blocks$: Observable<Block[]>;
  public transactions$: Observable<Transaction[]>;
  public currentCycle$: Observable<number>;
  public cycleProgress$: Observable<number>;
  public cycleStartingBlockLevel$: Observable<number>;
  public cycleEndingBlockLevel$: Observable<number>;
  public remainingTime$: Observable<string>;

  public fiatInfo$: Observable<CurrencyInfo>;
  public cryptoInfo$: Observable<CurrencyInfo>;
  public percentage$: Observable<number>;
  public historicData$: Observable<MarketDataSample[]>;

  public bakers: string[];

  public priceChartDatasets$: Observable<{ data: number[]; label: string }[]>;
  public priceChartLabels$: Observable<string[]>;
  public contracts$: Observable<TokenContract[]>;
  public proposalHash$: Observable<string>;
  public currentPeriodTimespan$: Observable<PeriodTimespan>;
  public currentPeriodKind$: Observable<string>;
  public currentPeriodIndex$: Observable<number>;
  public pricePeriod$ = new BehaviorSubject<number>(PricePeriod.day);

  public yayRolls$: Observable<number>;
  public nayRolls$: Observable<number>;
  public passRolls$: Observable<number>;
  public yayRollsPercentage$: Observable<number>;
  public nayRollsPercentage$: Observable<number>;
  public showRolls$: Observable<boolean>;

  constructor(
    private readonly actions$: Actions,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>,
    private readonly titleService: Title,
    private readonly metaTagService: Meta
  ) {
    super();
  }

  public ngOnInit() {
    this.store$.dispatch(actions.loadContracts());
    this.store$.dispatch(actions.loadLatestProposal());

    this.contracts$ = this.store$.select((state) => state.dashboard.contracts);
    this.bakers = Object.keys(jsonAccounts);
    this.blocks$ = this.store$.select((state) => state.dashboard.blocks);
    this.transactions$ = this.store$.select(
      (state) => state.dashboard.transactions
    );

    this.currentCycle$ = this.store$.select(fromRoot.app.currentCycle);
    this.cycleProgress$ = this.store$.select(fromRoot.app.cycleProgress);
    this.cycleStartingBlockLevel$ = this.store$.select(
      fromRoot.app.cycleStartingBlockLevel
    );
    this.cycleEndingBlockLevel$ = this.store$.select(
      fromRoot.app.cycleEndingBlockLevel
    );
    this.remainingTime$ = this.store$.select(fromRoot.app.remainingTime);

    this.fiatInfo$ = this.store$.select((state) => state.app.fiatCurrencyInfo);
    this.cryptoInfo$ = this.store$.select(
      (state) => state.app.cryptoCurrencyInfo
    );
    this.historicData$ = this.store$.select(
      (state) => state.dashboard.cryptoHistoricData
    );
    this.percentage$ = this.store$.select(
      fromRoot.dashboard.currencyGrowthPercentage
    );

    this.priceChartDatasets$ = this.historicData$.pipe(
      map((data) => [
        { data: data.map((dataItem) => dataItem.open), label: 'Price' },
      ])
    );
    this.priceChartLabels$ = this.pricePeriod$.pipe(
      switchMap((pricePeriod) =>
        this.historicData$.pipe(
          map((data) =>
            data.map((dataItem) =>
              pricePeriod === PricePeriod.day
                ? new Date(dataItem.time * 1000).toLocaleTimeString()
                : new Date(dataItem.time * 1000).toLocaleDateString()
            )
          )
        )
      )
    );

    this.currentPeriodTimespan$ = this.store$.select(
      (state) => state.dashboard.currentPeriodTimespan
    );
    this.currentPeriodKind$ = this.store$
      .select((state) => state.app.latestBlock)
      .pipe(
        filter((latestBlock) => !!latestBlock),
        map((latestBlock) =>
          $enum(PeriodKind).getKeyOrThrow(latestBlock.period_kind)
        )
      );
    this.currentPeriodIndex$ = this.store$
      .select((state) => state.app.latestBlock)
      .pipe(
        filter((latestBlock) => !!latestBlock),
        map((latestBlock) => {
          if (
            $enum(PeriodKind).indexOfValue(
              latestBlock.period_kind as PeriodKind
            ) >= 0
          ) {
            return (
              $enum(PeriodKind).indexOfValue(
                latestBlock.period_kind as PeriodKind
              ) + 1
            );
          } else {
            return -1;
          }
        })
      );

    this.proposalHash$ = this.store$
      .select((state) => state.app.latestBlock)
      .pipe(
        filter((latestBlock) => !!latestBlock),
        map((latestBlock) => latestBlock.active_proposal)
      );

    this.yayRolls$ = this.store$.select(fromRoot.dashboard.yayRolls);
    this.nayRolls$ = this.store$.select(fromRoot.dashboard.nayRolls);
    this.passRolls$ = this.store$.select(fromRoot.dashboard.passRolls);
    this.yayRollsPercentage$ = this.store$.select(
      fromRoot.dashboard.yayRollsPercentage
    );
    this.nayRollsPercentage$ = this.store$.select(
      fromRoot.dashboard.nayRollsPercentage
    );
    this.showRolls$ = combineLatest([
      this.store$.select((state) => state.app.latestBlock),
      this.yayRolls$,
    ]).pipe(
      map(
        ([latestBlock, yayRolls]) =>
          latestBlock &&
          [
            PeriodKind.Exploration as string,
            PeriodKind.Promotion as string,
          ].indexOf(latestBlock.period_kind) !== -1 &&
          yayRolls !== undefined
      )
    );

    this.subscriptions.push(
      getRefresh([
        this.actions$.pipe(ofType(actions.loadTransactionsSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsFailed)),
      ]).subscribe(() => this.store$.dispatch(actions.loadTransactions())),

      getRefresh([
        this.actions$.pipe(ofType(actions.loadBlocksSucceeded)),
        this.actions$.pipe(ofType(actions.loadBlocksFailed)),
      ]).subscribe(() => this.store$.dispatch(actions.loadBlocks())),

      this.pricePeriod$
        .pipe(
          switchMap((periodIndex) =>
            getRefresh([
              this.actions$.pipe(
                ofType(actions.loadCryptoHistoricDataSucceeded)
              ),
              this.actions$.pipe(ofType(actions.loadCryptoHistoricDataFailed)),
            ]).pipe(map(() => periodIndex))
          )
        )
        .subscribe((periodIndex) =>
          this.store$.dispatch(actions.loadCryptoHistoricData({ periodIndex }))
        ),

      this.actions$
        .pipe(ofType(appActions.loadPeriodInfosSucceeded))
        .subscribe(() =>
          this.store$.dispatch(actions.loadCurrentPeriodTimespan())
        ),

      this.contracts$
        .pipe(
          filter(
            (data) =>
              Array.isArray(data) &&
              data.some((item) => ['tzBTC', 'BTC'].includes(item.symbol))
          ),
          switchMap(() =>
            getRefresh([
              this.actions$.pipe(ofType(appActions.loadExchangeRateSucceeded)),
              this.actions$.pipe(ofType(appActions.loadExchangeRateFailed)),
            ])
          )
        )
        .subscribe(() =>
          this.store$.dispatch(
            appActions.loadExchangeRate({ from: 'BTC', to: 'USD' })
          )
        ),

      this.actions$
        .pipe(
          ofType(appActions.loadPeriodInfosSucceeded),
          switchMap(() =>
            getRefresh([
              this.actions$.pipe(ofType(actions.loadDivisionOfVotesSucceeded)),
              this.actions$.pipe(ofType(actions.loadDivisionOfVotesFailed)),
            ])
          )
        )
        .subscribe(() => this.store$.dispatch(actions.loadDivisionOfVotes()))
    );
    this.titleService.setTitle(`tezblock - Tezos block explorer`);
    this.metaTagService.updateTag({
      name: 'description',
      content:
        'tezblock is a block explorer built by AirGap for Tezos an open-source platform for assets and applications backed by a global community of validators, researchers, and builders.',
    });
  }

  public isMainnet() {
    const selectedNetwork = this.chainNetworkService.getNetwork();
    return selectedNetwork === TezosNetwork.MAINNET;
  }

  public changePricePeriod(periodIndex: number) {
    this.pricePeriod$.next(periodIndex);
  }
}
