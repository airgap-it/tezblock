import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewBlockService } from '@tezblock/services/blocks/blocks.service'
import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { aggregateOperationCounts } from '@tezblock/domain/tab'

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
        this.store$.select(state => state.accountDetails.orderBy)
      ),
      switchMap(([{ transactionHash }, pageSize, orderBy]) =>
        this.apiService.getTransactionsById(transactionHash, pageSize, orderBy).pipe(
          map(data => actions.loadTransactionsByHashSucceeded({ data })),
          catchError(error => of(actions.loadTransactionsByHashFailed({ error })))
        )
      )
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

  onLoadTransactionLoadCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByHash),
      map(() => actions.loadTransactionsCounts())
    )
  )

  loadTransactionsCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsCounts),
      withLatestFrom(this.store$.select(state => state.transactionDetails.transactionHash)),
      switchMap(([action, address]) =>
        this.apiService.getOperationCount('operation_group_hash', address).pipe(
          map(aggregateOperationCounts),
          map(counts => actions.loadTransactionsCountsSucceeded({ counts })),
          catchError(error => of(actions.loadTransactionsCountsFailed({ error })))
        )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly blockService: NewBlockService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
