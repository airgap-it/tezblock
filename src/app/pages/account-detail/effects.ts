import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { from, of, forkJoin, Observable } from 'rxjs'
import { map, catchError, filter, switchMap, take, tap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { get, isNil, negate } from 'lodash'

import { TransactionService } from '@tezblock/services/transaction/transaction.service'
import { BakingService } from '@tezblock/services/baking/baking.service'
import * as actions from './actions'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { ApiService } from '@tezblock/services/api/api.service'
import { AccountService } from '@tezblock/services/account/account.service'
import { ByCycleState, CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'
import { first, flatten } from '@tezblock/services/fp'
import * as fromRoot from '@tezblock/reducers'
import * as fromReducer from './reducer'
import { aggregateOperationCounts } from '@tezblock/domain/tab'
import { getTokenContracts, hasTokenHolders, fillTransferOperations } from '@tezblock/domain/contract'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { ContractService } from '@tezblock/services/contract/contract.service'
import { BakingRatingResponse } from './model'
import { OperationTypes } from '@tezblock/domain/operations'

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

  getRewardAmount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRewardAmont),
      switchMap(action =>
        this.rewardService.getRewardAmount(action.accountAddress, action.bakerAddress).pipe(
          map(rewardAmont => actions.loadRewardAmontSucceeded({ rewardAmont })),
          catchError(error => of(actions.loadRewardAmontFailed({ error })))
        )
      )
    )
  )

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      filter(({ kind }) => kind !== 'assets'),
      withLatestFrom(
        this.store$.select(state => state.accountDetails.transactions.pagination),
        this.store$.select(state => state.accountDetails.address),
        this.store$.select(state => state.accountDetails.transactions.orderBy)
      ),
      switchMap(([{ kind }, pagination, address, orderBy]) =>
        this.transactionService.getAllTransactionsByAddress(address, kind, pagination.currentPage * pagination.selectedSize, orderBy).pipe(
          switchMap(data => kind === OperationTypes.Transaction ? fillTransferOperations(data, this.chainNetworkService) : of(data)),
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

  onLoadTransactionLoadCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      map(() => actions.loadTransactionsCounts())
    )
  )

  loadTransactionsCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsCounts),
      withLatestFrom(this.store$.select(state => state.accountDetails.address)),
      switchMap(([action, address]) =>
        forkJoin(
          this.apiService.getOperationCount('source', address),
          this.apiService.getOperationCount('destination', address),
          this.apiService
            .getOperationCount('delegate', address)
            .pipe(map(counts => counts.map(count => (count.kind === 'origination' ? { ...count, kind: 'delegation' } : count))))
        ).pipe(
          map(flatten),
          map(aggregateOperationCounts),
          map(counts => actions.loadTransactionsCountsSucceeded({ counts })),
          catchError(error => of(actions.loadTransactionsCountsFailed({ error })))
        )
      )
    )
  )

  loadBalanceForLast30Days$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalanceForLast30Days),
      switchMap(({ address }) =>
        this.apiService.getBalanceForLast30Days(address).pipe(
          map(balanceFromLast30Days => {
            if (balanceFromLast30Days[0].balance === null) {
              return actions.loadExtraBalance({ temporaryBalance: balanceFromLast30Days })
            } else {
              return actions.loadBalanceForLast30DaysSucceeded({ balanceFromLast30Days })
            }
          }),
          catchError(error => of(actions.loadBalanceForLast30DaysFailed({ error })))
        )
      )
    )
  )

  loadExtraBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadExtraBalance),
      withLatestFrom(
        this.store$.select(state => state.accountDetails.address),
        this.store$.select(state => state.accountDetails.temporaryBalance)
      ),
      switchMap(([action, accountAddress, temporaryBalance]) => {
        return this.apiService.getEarlierBalance(accountAddress, temporaryBalance).pipe(
          map(extraBalance => {
            return actions.loadExtraBalanceSucceeded({ extraBalance })
          }),
          catchError(error => of(actions.loadBalanceForLast30DaysFailed({ error })))
        )
      })
    )
  )

  loadBakingBadRatings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakingBadRatings),
      withLatestFrom(this.store$.select(state => state.accountDetails)),
      switchMap(([{ address }, state]) =>
        this.cacheService.get(CacheKeys.fromCurrentCycle).pipe(
          switchMap(currentCycleCache => {
            const bakingBadRating = get(currentCycleCache, `fromAddress[${address}].bakerData.bakingBadRating`)
            const tezosBakerFee = get(currentCycleCache, `fromAddress[${address}].tezosBakerFee`)

            // bug was reported so now I compare to undefined OR null, not only undefined
            if (bakingBadRating && tezosBakerFee) {
              return of(<BakingRatingResponse>{ bakingRating: bakingBadRating, tezosBakerFee: tezosBakerFee })
            }

            return this.bakingService.getBakingBadRatings(address).pipe(map(response => fromReducer.fromBakingBadResponse(response, state)))
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

            // bug was reported so now I compare to undefined OR null, not only undefined
            if (tezosBakerRating && tezosBakerFee) {
              return of(<BakingRatingResponse>{ bakingRating: tezosBakerRating, tezosBakerFee: tezosBakerFee })
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

  onLoadTransactionsSucceededLoadErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKindSucceeded),
      filter(({ data }) => data.some(transaction => transaction.status !== 'applied')),
      map(({ data }) => actions.loadTransactionsErrors({ transactions: data }))
    )
  )

  loadTransactionsErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsErrors),
      switchMap(({ transactions }) =>
        this.apiService.getErrorsForOperations(transactions).pipe(
          map(operationErrorsById => actions.loadTransactionsErrorsSucceeded({ operationErrorsById })),
          catchError(error => of(actions.loadTransactionsErrorsFailed({ error })))
        )
      )
    )
  )

  onBakerLoadBakerReward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccountSucceeded),
      filter(({ account }) => account.is_baker),
      map(({ account }) => actions.loadBakerReward({ bakerAddress: account.account_id }))
    )
  )

  loadBakerReward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakerReward),
      switchMap(({ bakerAddress }) =>
        this.store$.select(fromRoot.app.currentCycle).pipe(
          filter(negate(isNil)),
          take(1),
          switchMap(currentCycle =>
            this.rewardService.getRewardsForAddressInCycle(bakerAddress, ++currentCycle).pipe(
              map(bakerReward => actions.loadBakerRewardSucceeded({ bakerReward })),
              catchError(error => of(actions.loadBakerRewardFailed({ error })))
            )
          )
        )
      )
    )
  )

  onLoadAccountLoadContractAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      withLatestFrom(this.store$.select(state => state.accountDetails.contractAssets.data)),
      filter(([action, contractAssets]) => contractAssets === undefined),
      map(() => actions.loadContractAssets())
    )
  )

  loadContractAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractAssets),
      withLatestFrom(this.store$.select(state => state.accountDetails.address)),
      switchMap(([action, address]) =>
        forkJoin(
          getTokenContracts(this.chainNetworkService.getNetwork())
            .data.filter(hasTokenHolders)
            .map(contract =>
              this.contractService.loadTokenHolders(contract).pipe(
                map(tokenHolders => ({
                  contract,
                  amount: tokenHolders
                  .filter(tokenHolder => tokenHolder.address === address)
                  .map(tokenHolder => parseFloat(tokenHolder.amount)).reduce((a, b) => a + b, 0)
                })
                )
              )
            )
        ).pipe(
          map(data => data.filter(item => item.amount > 0)),
          map(data => actions.loadContractAssetsSucceeded({ data })),
          catchError(error => of(actions.loadContractAssetsFailed({ error })))
        )
      )
    )
  )

  constructor(
    private readonly accountService: AccountService,
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly bakingService: BakingService,
    private readonly cacheService: CacheService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly contractService: ContractService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: TransactionService
  ) {}
}
