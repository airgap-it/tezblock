import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { forkJoin, of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom, filter } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewBlockService } from '@tezblock/services/blocks/blocks.service'
import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { OperationTypes } from '@tezblock/domain/operations'
import { aggregateOperationCounts } from '@tezblock/domain/tab'

@Injectable()
export class BlockDetailEffects {
  getBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlock),
      switchMap(({ id }) =>
        this.blockService.getById(id).pipe(
          map(block => actions.loadBlockSucceeded({ block })),
          catchError(error => of(actions.loadBlockFailed({ error })))
        )
      )
    )
  )

  getTransactionsOnBlockLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlockSucceeded),
      withLatestFrom(
        this.store$.select(state => state.blockDetails.transactionsLoadedByBlockHash),
        this.store$.select(state => state.blockDetails.kind)
      ),
      filter(([{ block }, transactionsLoadedByBlockHash]) => block.hash !== transactionsLoadedByBlockHash),
      map(([{ block }, transactionsLoadedByBlockHash, kind]) => actions.loadTransactionsByKind({ blockHash: block.hash, kind: kind }))
    )
  )

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      withLatestFrom(
        this.store$.select(state => state.blockDetails.pageSize),
        this.store$.select(state => state.blockDetails.orderBy)
      ),
      switchMap(([{ blockHash, kind }, pageSize, orderBy]) =>
        this.apiService.getTransactionsByField(blockHash, 'block_hash', kind, pageSize, orderBy).pipe(
          map(data => actions.loadTransactionsByKindSucceeded({ data })),
          catchError(error => of(actions.loadTransactionsByKindFailed({ error })))
        )
      )
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(
        this.store$.select(state => state.blockDetails.block),
        this.store$.select(state => state.blockDetails.kind)
      ),
      map(([action, block, kind]) => actions.loadTransactionsByKind({ blockHash: block.hash, kind }))
    )
  )

  onIncreaseBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increaseBlock),
      withLatestFrom(this.store$.select(state => state.blockDetails)),
      map(([action, block]) => actions.loadBlock({ id: block.id }))
    )
  )

  onDecreaseBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.decreaseBlock),
      withLatestFrom(this.store$.select(state => state.blockDetails)),
      map(([action, block]) => actions.loadBlock({ id: block.id }))
    )
  )

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortTransactionsByKind),
      withLatestFrom(
        this.store$.select(state => state.blockDetails.block),
        this.store$.select(state => state.blockDetails.kind)
      ),
      map(([action, block, kind]) => actions.loadTransactionsByKind({ blockHash: block.hash, kind }))
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
      withLatestFrom(this.store$.select(state => state.blockDetails.id)),
      switchMap(([action, address]) =>
        this.apiService.getOperationCount('block_level', address).pipe(
          map(aggregateOperationCounts),
          map(counts => actions.loadTransactionsCountsSucceeded({ counts })),
          catchError(error => of(actions.loadTransactionsCountsFailed({ error })))
        )
      )
    )
  )

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

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly blockService: NewBlockService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
