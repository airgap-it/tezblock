import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { from, of } from 'rxjs'
import { map, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewTransactionService } from '@tezblock/services/transaction/new-transaction.service'
import { BakingService } from '@tezblock/services/baking/baking.service'
import * as actions from './actions'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { ApiService } from '@tezblock/services/api/api.service'
import { NewAccountService } from '@tezblock/services/account/account.service'
import { ByCycleState, CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'
import { first } from '@tezblock/services/fp'
import * as fromRoot from '@tezblock/reducers'
import * as fromReducer from './reducer'
import { get } from 'lodash'

@Injectable()
export class AccountDetailEffects {
  getAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      switchMap(({ address }) =>
        this.apiService.getAccountById(address).pipe(
          map(accounts => actions.loadAccountSucceeded({ account: first(accounts) })),
          catchError(error => of(actions.loadAccountFailed({ error })))
        )
      )
    )
  )

  getDelegatedAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      switchMap(({ address }) =>
        this.accountService.getDelegatedAccounts(address).pipe(
          map(accounts => actions.loadDelegatedAccountsSucceeded({ accounts })),
          catchError(error => of(actions.loadDelegatedAccountsFailed({ error })))
        )
      )
    )
  )

  getRewardAmont$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRewardAmont),
      switchMap(action =>
        this.rewardService.getRewardAmont(action.accountAddress, action.bakerAddress).pipe(
          map(rewardAmont => actions.loadRewardAmontSucceeded({ rewardAmont })),
          catchError(error => of(actions.loadRewardAmontFailed({ error })))
        )
      )
    )
  )

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      withLatestFrom(
        this.store$.select(state => state.accountDetails.pageSize),
        this.store$.select(state => state.accountDetails.address),
        this.store$.select(state => state.accountDetails.sorting.value),
        this.store$.select(state => state.accountDetails.sorting.direction)
      ),

      switchMap(([{ kind }, pageSize, address, sortingValue, sortingDirection]) =>
        this.transactionService.getAllTransactionsByAddress(address, kind, pageSize, sortingValue, sortingDirection).pipe(
          map(data => actions.loadTransactionsByKindSucceeded({ data })),
          catchError(error => of(actions.loadTransactionsByKindFailed({ error })))
        )
      )
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select(state => state.accountDetails.kind)),
      map(([action, kind]) => actions.loadTransactionsByKind({ kind }))
    )
  )

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortTransactionsByKind),
      withLatestFrom(this.store$.select(state => state.accountDetails.kind)),
      map(([action, kind]) => actions.loadTransactionsByKind({ kind }))
    )
  )

  loadBalanceForLast30Days$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalanceForLast30Days),
      withLatestFrom(this.store$.select(state => state.accountDetails.address)),
      switchMap(([action, accountAddress]) =>
        this.apiService.getBalanceForLast30Days(accountAddress).pipe(
          map(balanceFromLast30Days => actions.loadBalanceForLast30DaysSucceeded({ balanceFromLast30Days })),
          catchError(error => of(actions.loadBalanceForLast30DaysFailed({ error })))
        )
      )
    )
  )

  loadBakingBadRatings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakingBadRatings),
      withLatestFrom(this.store$.select(state => state.accountDetails)),
      switchMap(([action, state]) =>
        this.cacheService.get(CacheKeys.fromCurrentCycle).pipe(
          switchMap(currentCycleCache => {
            const bakingBadRating = get(currentCycleCache, `fromAddress[${state.address}].bakerData.bakingBadRating`)
            const tezosBakerFee = get(currentCycleCache, `fromAddress[${state.address}].tezosBakerFee`)

            if (bakingBadRating !== undefined && tezosBakerFee !== undefined) {
              return of(<actions.BakingRatingResponse>{ bakingRating: bakingBadRating, tezosBakerFee: tezosBakerFee })
            }

            return this.bakingService
              .getBakingBadRatings(state.address)
              .pipe(map(response => fromReducer.fromBakingBadResponse(response, state)))
          }),
          map(response => actions.loadBakingBadRatingsSucceeded({ response })),
          catchError(error => of(actions.loadBakingBadRatingsFailed({ error })))
        )
      )
    )
  )

  cachBakingBadRatings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.loadBakingBadRatingsSucceeded),
        withLatestFrom(this.store$.select(state => state.accountDetails)),
        tap(([action, state]) =>
          this.cacheService.update<ByCycleState>(CacheKeys.fromCurrentCycle, currentCycleCache => ({
            ...currentCycleCache,
            fromAddress: {
              ...get(currentCycleCache, 'fromAddress'),
              [state.address]: {
                ...get(currentCycleCache, `fromAddress[${state.address}]`),
                bakerData: {
                  ...get(currentCycleCache, `fromAddress[${state.address}].bakerData`),
                  bakingBadRating: state.bakerTableRatings.bakingBadRating
                },
                tezosBakerFee: state.tezosBakerFee
              }
            }
          }))
        )
      ),
    { dispatch: false }
  )

  loadTezosBakerRating$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTezosBakerRating),
      withLatestFrom(this.store$.select(state => state.accountDetails)),
      switchMap(([{ address, updateFee }, state]) =>
        this.cacheService.get(CacheKeys.fromCurrentCycle).pipe(
          switchMap(currentCycleCache => {
            const tezosBakerRating = get(currentCycleCache, `fromAddress[${state.address}].bakerData.tezosBakerRating`)
            const tezosBakerFee = get(currentCycleCache, `fromAddress[${state.address}].tezosBakerFee`)

            if (tezosBakerRating !== undefined && tezosBakerFee !== undefined) {
              return of(<actions.BakingRatingResponse>{ bakingRating: tezosBakerRating, tezosBakerFee: tezosBakerFee })
            }

            return from(this.bakingService.getTezosBakerInfos(address)).pipe(
              map(response => fromReducer.fromMyTezosBakerResponse(response, state, updateFee))
            )
          }),
          map(response => actions.loadTezosBakerRatingSucceeded({ response, address, updateFee })),
          catchError(error => of(actions.loadTezosBakerRatingFailed({ error })))
        )
      )
    )
  )

  cachTezosBakerRating$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.loadTezosBakerRatingSucceeded),
        withLatestFrom(this.store$.select(state => state.accountDetails)),
        tap(([{ response, address }, state]) =>
          this.cacheService.update<ByCycleState>(CacheKeys.fromCurrentCycle, currentCycleCache => ({
            ...currentCycleCache,
            fromAddress: {
              ...get(currentCycleCache, 'fromAddress'),
              [address]: {
                ...get(currentCycleCache, `fromAddress[${address}]`),
                bakerData: {
                  ...get(currentCycleCache, `fromAddress[${address}].bakerData`),
                  tezosBakerRating: state.bakerTableRatings.tezosBakerRating
                },
                tezosBakerFee: state.tezosBakerFee
              }
            }
          }))
        )
      ),
    { dispatch: false }
  )

  constructor(
    private readonly accountService: NewAccountService,
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly bakingService: BakingService,
    private readonly cacheService: CacheService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: NewTransactionService
  ) {}
}
