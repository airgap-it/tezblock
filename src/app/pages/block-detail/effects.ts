import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom, filter } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Router } from '@angular/router'

import { BlockService } from '@tezblock/services/blocks/blocks.service'
import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { aggregateOperationCounts } from '@tezblock/domain/tab'

@Injectable()
export class BlockDetailEffects {
  getBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlock),
      switchMap(({ id }) =>
        this.blockService.getById(id, ['volume', 'fee']).pipe(
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
        this.store$.select(state => state.blockDetails.transactions.pagination),
        this.store$.select(state => state.blockDetails.transactions.orderBy)
      ),
      switchMap(([{ blockHash, kind }, pagination, orderBy]) =>
        this.apiService
          .getTransactionsByField(blockHash, 'block_hash', kind, pagination.currentPage * pagination.selectedSize, orderBy)
          .pipe(
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

  changeBlock$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.changeBlock),
        withLatestFrom(this.store$.select(state => state.blockDetails.id)),
        map(([{ change }, address]) => this.router.navigate([`/block/${Number(address) + change}`]))
      ),
    { dispatch: false }
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly blockService: BlockService,
    private readonly router: Router,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
