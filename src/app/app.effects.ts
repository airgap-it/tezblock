import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, combineLatest, forkJoin } from 'rxjs'
import { catchError, map, switchMap, tap, filter, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { get, isNil, negate } from 'lodash'
import BigNumber from 'bignumber.js'

import * as actions from './app.actions'
import { BaseService, Operation, ENVIRONMENT_URL } from '@tezblock/services/base.service'
import { Block } from '@tezblock/interfaces/Block'
import { first } from '@tezblock/services/fp'
import * as fromRoot from '@tezblock/reducers'
import { ByCycleState, CacheService, CacheKeys, ExchangeRates } from '@tezblock/services/cache/cache.service'
import { BlockService } from '@tezblock/services/blocks/blocks.service'
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { Currency } from '@tezblock/domain/airgap'

@Injectable()
export class AppEffects {
  loadLatestBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestBlock),
      switchMap(() =>
        this.blockService.getLatest().pipe(
          map(latestBlock => actions.loadLatestBlockSucceeded({ latestBlock })),
          catchError(error => of(actions.loadLatestBlockFailed({ error })))
        )
      )
    )
  )

  onCurrentCycleLoadFirstBlockOfCycle$ = createEffect(() =>
    this.store$.select(fromRoot.app.currentCycle).pipe(
      filter(negate(isNil)),
      map(cycle => actions.loadFirstBlockOfCycle({ cycle }))
    )
  )

  onCurrentCycleChaneResetCache$ = createEffect(
    () =>
      combineLatest(this.store$.select(fromRoot.app.currentCycle), this.cacheService.get<ByCycleState>(CacheKeys.fromCurrentCycle)).pipe(
        filter(([currentCycle, cycleCache]) => currentCycle && (!cycleCache || (cycleCache && cycleCache.cycleNumber !== currentCycle))),
        tap(([currentCycle, cycleCache]) => {
          this.cacheService
            .set<ByCycleState>(CacheKeys.fromCurrentCycle, { cycleNumber: currentCycle })
            .subscribe(() => {})
        })
      ),
    { dispatch: false }
  )

  loadFirstBlockOfCycle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadFirstBlockOfCycle),
      switchMap(({ cycle }) =>
        // replacement for: apiService.getCurrentCycleRange
        this.baseService
          .post<Block[]>('blocks', {
            predicates: [
              {
                field: 'meta_cycle',
                operation: Operation.eq,
                set: [cycle],
                inverse: false
              }
            ],
            orderBy: [
              {
                field: 'timestamp',
                direction: 'asc'
              }
            ],
            limit: 1
          })
          .pipe(
            map(first),
            map(firstBlockOfCycle => actions.loadFirstBlockOfCycleSucceeded({ firstBlockOfCycle })),
            catchError(error => of(actions.loadFirstBlockOfCycleFailed({ error })))
          )
      )
    )
  )

  loadPeriodInfos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadPeriodInfos),
      switchMap(() =>
        forkJoin(
          this.baseService
            .post<{ meta_voting_period: number; meta_voting_period_position: number }[]>('blocks', {
              fields: ['meta_voting_period', 'meta_voting_period_position'],
              orderBy: [
                {
                  field: 'level',
                  direction: 'desc'
                }
              ],
              limit: 1
            })
            .pipe(map(first)),
          this.baseService
            .get<any>(`${ENVIRONMENT_URL.rpcUrl}/chains/main/blocks/head/context/constants`, true)
            .pipe(map(response => response.blocks_per_voting_period))
        ).pipe(
          map(([{ meta_voting_period, meta_voting_period_position }, blocksPerVotingPeriod]) =>
            actions.loadPeriodInfosSucceeded({
              currentVotingPeriod: meta_voting_period,
              currentVotingeriodPosition: meta_voting_period_position,
              blocksPerVotingPeriod
            })
          ),
          catchError(error => of(actions.loadPeriodInfosFailed({ error })))
        )
      )
    )
  )

  loadCryptoPriceFromCache$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCryptoPriceFromCache),
      withLatestFrom(
        this.store$.select(state => state.app.cryptoCurrencyInfo),
        this.store$.select(state => state.app.fiatCurrencyInfo)
      ),
      switchMap(([action, cryptoCurrencyInfo, fiatCurrencyInfo]) =>
        this.cacheService.get<ExchangeRates>(CacheKeys.exchangeRates).pipe(
          map(currency => {
            const fiatCurrency = get(get(currency, Currency.XTZ), fiatCurrencyInfo.currency)
            const cryptoCurrency = get(get(currency, Currency.XTZ), cryptoCurrencyInfo.currency)
            const fiatPrice = new BigNumber(fiatCurrency)
            const cryptoPrice = new BigNumber(cryptoCurrency)

            return actions.loadCryptoPriceFromCacheSucceeded({ fiatPrice, cryptoPrice })
          }),
          catchError(error => of(actions.loadCryptoPriceFromCacheFailed({ error })))
        )
      )
    )
  )

  onLoadedFromCacheSetCryptoPrices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCryptoPriceFromCacheSucceeded),
      map(({ fiatPrice, cryptoPrice }) => actions.loadCryptoPriceSucceeded({ fiatPrice, cryptoPrice }))
    )
  )

  loadCryptoPrice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCryptoPrice),
      withLatestFrom(
        this.store$.select(state => state.app.cryptoCurrencyInfo),
        this.store$.select(state => state.app.fiatCurrencyInfo)
      ),
      switchMap(([action, cryptoCurrencyInfo, fiatCurrencyInfo]) =>
        this.cacheService.get<ExchangeRates>(CacheKeys.exchangeRates).pipe(
          switchMap(exchangeRates =>
            this.cryptoPricesService.getCryptoPrices('xtz', [fiatCurrencyInfo.currency, cryptoCurrencyInfo.currency]).pipe(
              map(prices => {
                const fiatCurrency =
                  get(prices, fiatCurrencyInfo.currency) || get(get(exchangeRates, Currency.XTZ), fiatCurrencyInfo.currency)
                const cryptoCurrency =
                  get(prices, cryptoCurrencyInfo.currency) || get(get(exchangeRates, Currency.XTZ), cryptoCurrencyInfo.currency)
                const fiatPrice = new BigNumber(fiatCurrency)
                const cryptoPrice = new BigNumber(cryptoCurrency)

                return actions.loadCryptoPriceSucceeded({ fiatPrice, cryptoPrice })
              }),
              catchError(error => {
                const fiatCurrency = get(get(exchangeRates, Currency.XTZ), fiatCurrencyInfo.currency)
                const cryptoCurrency = get(get(exchangeRates, Currency.XTZ), cryptoCurrencyInfo.currency)
                const fiatPrice = new BigNumber(fiatCurrency)
                const cryptoPrice = new BigNumber(cryptoCurrency)

                return of(actions.loadCryptoPriceSucceeded({ fiatPrice, cryptoPrice }))
              })
            )
          )
        )
      )
    )
  )

  loadExchangeRate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadExchangeRate),
      switchMap(action =>
        this.cacheService.get<ExchangeRates>(CacheKeys.exchangeRates).pipe(
          switchMap(exchangeRates =>
            this.cryptoPricesService.getCryptoPrices(action.from, [action.to]).pipe(
              map(prices => {
                const price = get(prices, action.to) || get(get(exchangeRates, action.from), action.to)

                return actions.loadExchangeRateSucceeded({ from: action.from, to: action.to, price })
              }),
              catchError(error => {
                const price = get(get(exchangeRates, action.from), action.to)

                return price
                  ? of(actions.loadExchangeRateSucceeded({ from: action.from, to: action.to, price }))
                  : of(actions.loadExchangeRateFailed({ error }))
              })
            )
          )
        )
      )
    )
  )

  loadCryptoHistoricData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCryptoHistoricData),
      switchMap(() =>
        this.cryptoPricesService.getHistoricCryptoPrices(24, new Date(), 'USD', 'XTZ').pipe(
          map(cryptoHistoricData => actions.loadCryptoHistoricDataSucceeded({ cryptoHistoricData })),
          catchError(error => of(actions.loadCryptoHistoricDataFailed({ error })))
        )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly baseService: BaseService,
    private readonly blockService: BlockService,
    private readonly cacheService: CacheService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
