import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewBlockService } from '@tezblock/services/blocks/blocks.service'
import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'

@Injectable()
export class TransactionDetailEffects {
  getLatestBlock$ = createEffect(() =>
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

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByHash),
      withLatestFrom(
        this.store$.select(state => state.transactionDetails.pageSize),
        this.store$.select(state => state.accountDetails.sorting.value),
        this.store$.select(state => state.accountDetails.sorting.direction)
      ),
      switchMap(([{ transactionHash }, pageSize, sortingValue, sortingDirection]) => {
        if (!sortingValue) {
          return this.apiService.getTransactionsById(transactionHash, pageSize).pipe(
            map(data => actions.loadTransactionsByHashSucceeded({ data })),
            catchError(error => of(actions.loadTransactionsByHashFailed({ error })))
          )
        } else {
          if (!sortingDirection) {
            return this.apiService.getTransactionsById(transactionHash, pageSize).pipe(
              map(data => actions.loadTransactionsByHashSucceeded({ data })),
              catchError(error => of(actions.loadTransactionsByHashFailed({ error })))
            )
          } else {
            return this.apiService.getTransactionsById(transactionHash, pageSize).pipe(
              map(data => actions.loadTransactionsByHashSucceeded({ data })),
              catchError(error => of(actions.loadTransactionsByHashFailed({ error })))
            )
          }
        }
      })
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select(state => state.transactionDetails.transactionHash)),
      map(([action, transactionHash]) => actions.loadTransactionsByHash({ transactionHash }))
    )
  )

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortTransactionsByKind),
      withLatestFrom(this.store$.select(state => state.transactionDetails.transactionHash)),
      map(([action, transactionHash]) => actions.loadTransactionsByHash({ transactionHash }))
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly blockService: NewBlockService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
