import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom, filter } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { NewBlockService } from '@tezblock/services/blocks/blocks.service'
import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { OperationTypes } from '@tezblock/domain/operations'

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
