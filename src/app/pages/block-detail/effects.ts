import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, merge, timer } from 'rxjs'
import { map, catchError, delay, switchMap, withLatestFrom, filter } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewBlockService } from '@tezblock/services/blocks/blocks.service'
import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { refreshRate } from '@tezblock/services/facade/facade'
import { OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'

@Injectable()
export class BlockDetailEffects {
  getBlobkRefresh$ = createEffect(() =>
    merge(this.actions$.pipe(ofType(actions.loadBlockSucceeded)), this.actions$.pipe(ofType(actions.loadBlockFailed))).pipe(
      delay(refreshRate),
      withLatestFrom(this.store$.select(state => state.blockDetails.id)),
      map(([action, id]) => actions.loadBlock({ id }))
    )
  )

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

  getTransactionsRefresh$ = createEffect(() =>
    merge(
      this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)),
      this.actions$.pipe(ofType(actions.loadTransactionsByKindFailed))
    ).pipe(
      withLatestFrom(this.store$.select(state => state.blockDetails.block), this.store$.select(state => state.blockDetails.kind)),
      switchMap(([action, block, kind]) =>
        timer(refreshRate, refreshRate).pipe(map(() => actions.loadTransactionsByKind({ blockHash: block.hash, kind })))
      )
    )
  )

  getTransactionsOnBlockLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlockSucceeded),
      withLatestFrom(this.store$.select(state => state.blockDetails.transactionsLoadedByBlockHash)),
      filter(([{ block }, transactionsLoadedByBlockHash]) => block.hash !== transactionsLoadedByBlockHash),
      map(([{ block }, transactionsLoadedByBlockHash]) => actions.loadTransactionsByKind({ blockHash: block.hash, kind: OperationTypes.Transaction }))
    )
  )

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      withLatestFrom(this.store$.select(state => state.blockDetails.pageSize)),
      switchMap(([{ blockHash, kind }, pageSize]) =>
        this.apiService.getTransactionsByField(blockHash, 'block_hash', kind, pageSize).pipe(
          map(data => actions.loadTransactionsByKindSucceeded({ data })),
          catchError(error => of(actions.loadTransactionsByKindFailed({ error })))
        )
      )
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select(state => state.blockDetails.block), this.store$.select(state => state.blockDetails.kind)),
      map(([action, block, kind]) => actions.loadTransactionsByKind({ blockHash: block.hash, kind }))
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly blockService: NewBlockService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
