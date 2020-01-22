import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewTransactionService } from '@tezblock/services/transaction/new-transaction.service'
import { BakingService } from '@tezblock/services/baking/baking.service'
import * as actions from './actions'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { ApiService } from '@tezblock/services/api/api.service'
import { NewAccountService } from '@tezblock/services/account/account.service'
import { first } from '@tezblock/services/fp'
import * as fromRoot from '@tezblock/reducers'

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
      withLatestFrom(this.store$.select(state => state.accountDetails.pageSize), this.store$.select(state => state.accountDetails.address)),
      switchMap(([{ kind }, pageSize, address]) =>
        this.transactionService.getAllTransactionsByAddress(address, kind, pageSize).pipe(
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

  constructor(
    private readonly accountService: NewAccountService,
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly bakingService: BakingService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: NewTransactionService
  ) {}
}
