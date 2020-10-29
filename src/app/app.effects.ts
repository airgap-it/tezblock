import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, combineLatest, forkJoin, from } from 'rxjs'
import { catchError, map, switchMap, tap, filter, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { get, isNil, negate } from 'lodash'
import BigNumber from 'bignumber.js'
import moment from 'moment'

import * as actions from './app.actions'
import { BaseService, Operation, ENVIRONMENT_URL } from '@tezblock/services/base.service'
import { Block } from '@tezblock/interfaces/Block'
import { first } from '@tezblock/services/fp'
import * as fromRoot from '@tezblock/reducers'
import { CurrentCycleState, CacheService, CacheKeys, ExchangeRates } from '@tezblock/services/cache/cache.service'
import { BlockService } from '@tezblock/services/blocks/blocks.service'
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { Currency } from '@tezblock/domain/airgap'
import { ProtocolVariablesService } from '@tezblock/services/protocol-variables/protocol-variables.service'
import { ProposalService } from '@tezblock/services/proposal/proposal.service'

@Injectable()
export class AppEffects {
  loadLatestBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestBlock),
      withLatestFrom(this.store$.select(state => state.app.latestBlock)),
      filter(([action, latestBlock]) => !latestBlock || moment().diff(moment(latestBlock.timestamp), 'seconds') > 60),
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
      combineLatest([
        this.store$.select(fromRoot.app.currentCycle),
        this.cacheService.get<CurrentCycleState>(CacheKeys.fromCurrentCycle)
      ]).pipe(
        filter(([currentCycle, cycleCache]) => currentCycle && (!cycleCache || (cycleCache && cycleCache.cycleNumber !== currentCycle))),
        tap(([currentCycle, cycleCache]) => {
          this.cacheService
            .set<CurrentCycleState>(CacheKeys.fromCurrentCycle, { cycleNumber: currentCycle })
            .subscribe(() => {})
        })
      ),
    { dispatch: false }
  )

  onCurrentCycleChaneLoadProtocolVariables$ = createEffect(() =>
    this.store$.select(fromRoot.app.currentCycle).pipe(
      filter(negate(isNil)),
      map(() => actions.loadProtocolVariables())
    )
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

  onLoadProtocolVariablesSucceededLoadPeriodInfos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProtocolVariablesSucceeded),
      map(() => actions.loadPeriodInfos())
    )
  )

  loadPeriodInfos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadPeriodInfos),
      switchMap(() =>
        this.proposalService.getPeriodInfos().pipe(
          withLatestFrom(this.store$.select(state => state.app.protocolVariables)),
          map(([{ meta_voting_period, meta_voting_period_position }, protocolVariables]) =>
            actions.loadPeriodInfosSucceeded({
              currentVotingPeriod: meta_voting_period,
              currentVotingeriodPosition: meta_voting_period_position,
              blocksPerVotingPeriod: protocolVariables.blocks_per_voting_period
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

  loadProtocolVariables$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProtocolVariables),
      switchMap(() =>
        this.protocolVariablesService.getProtocolVariables().pipe(
          map(protocolVariables => actions.loadProtocolVariablesSucceeded({ protocolVariables })),
          catchError(error => of(actions.loadProtocolVariablesFailed({ error })))
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
    private readonly protocolVariablesService: ProtocolVariablesService,
    private readonly proposalService: ProposalService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
