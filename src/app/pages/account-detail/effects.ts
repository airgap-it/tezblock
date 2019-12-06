import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewTransactionService } from '@tezblock/services/transaction/new-transaction.service'
import * as actions from './actions'
import { RewardService } from '@tezblock/services/reward/reward.service'
import * as fromRoot from '@tezblock/reducers'

@Injectable()
export class AccountDetailEffects {
  getDoubleBakings$ = createEffect(() =>
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
      ofType(actions.loadDataByKind),
      withLatestFrom(this.store$.select(state => state.accountDetails.pageSize)),
      switchMap(([{ kind, address }, pageSize]) =>
        this.transactionService.getAllTransactionsByAddress(address, kind, pageSize).pipe(
          map(data => actions.loadDataByKindSucceeded({ data })),
          catchError(error => of(actions.loadDataByKindFailed({ error })))
        )
      )
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select(state => state.accountDetails.kind), this.store$.select(state => state.accountDetails.address)),
      map(([action, kind, address]) => actions.loadDataByKind({ kind, address }))
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: NewTransactionService
  ) {}
}
