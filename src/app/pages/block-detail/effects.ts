import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  switchMap,
  withLatestFrom,
  filter,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { BlockService } from '@tezblock/services/blocks/blocks.service';
import * as actions from './actions';
import { ApiService } from '@tezblock/services/api/api.service';
import * as fromRoot from '@tezblock/reducers';
import { aggregateOperationCounts } from '@tezblock/domain/tab';
import { fillTransferOperations } from '@tezblock/domain/contract';
import { OperationTypes } from '@tezblock/domain/operations';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';

@Injectable()
export class BlockDetailEffects {
  getBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlock),
      switchMap(({ id }) =>
        this.blockService.getById(id, ['volume', 'fee']).pipe(
          map((block) => actions.loadBlockSucceeded({ block })),
          catchError((error) => of(actions.loadBlockFailed({ error })))
        )
      )
    )
  );

  getTransactionsOnBlockLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBlockSucceeded),
      withLatestFrom(
        this.store$.select(
          (state) => state.blockDetails.transactionsLoadedByBlockHash
        )
      ),
      filter(
        ([{ block }, transactionsLoadedByBlockHash]) =>
          block && block.hash !== transactionsLoadedByBlockHash
      ),
      map(([{ block }]) => actions.loadTransactions({ blockHash: block.hash }))
    )
  );

  loadOperationsByKind$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationsByKind),
      withLatestFrom(
        this.store$.select((state) => state.blockDetails.operations.pagination),
        this.store$.select((state) => state.blockDetails.operations.orderBy)
      ),
      switchMap(([{ blockHash, kind }, pagination, orderBy]) =>
        this.apiService
          .getTransactionsByField(
            blockHash,
            'block_hash',
            kind,
            pagination.currentPage * pagination.selectedSize,
            orderBy
          )
          .pipe(
            switchMap((data) =>
              kind === OperationTypes.Transaction
                ? fillTransferOperations(data, this.chainNetworkService)
                : of(data)
            ),
            map((data) => actions.loadOperationsByKindSucceeded({ data })),
            catchError((error) =>
              of(actions.loadOperationsByKindFailed({ error }))
            )
          )
      )
    )
  );

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactions),
      withLatestFrom(
        this.store$.select((state) => state.blockDetails.operations.pagination),
        this.store$.select((state) => state.blockDetails.operations.orderBy)
      ),
      switchMap(([{ blockHash }, pagination, orderBy]) =>
        this.apiService
          .getTransactionsByField(
            blockHash,
            'block_hash',
            OperationTypes.Transaction,
            pagination.currentPage * pagination.selectedSize,
            orderBy
          )
          .pipe(
            switchMap((data) =>
              fillTransferOperations(data, this.chainNetworkService)
            ),
            map((data) => actions.loadTransactionsSucceeded({ data })),
            catchError((error) => of(actions.loadTransactionsFailed({ error })))
          )
      )
    )
  );

  onLoadTransactionsSucceededEmitLoadOperationsByKindSucceeded$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.loadTransactionsSucceeded),
        map(({ data }) => actions.loadOperationsByKindSucceeded({ data }))
      )
  );

  onLoadTransactionsFailedEmitLoadOperationsByKindFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsFailed),
      map(({ error }) => actions.loadOperationsByKindFailed({ error }))
    )
  );

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(
        this.store$.select((state) => state.blockDetails.block),
        this.store$.select((state) => state.blockDetails.kind)
      ),
      map(([action, block, kind]) =>
        actions.loadOperationsByKind({ blockHash: block.hash, kind })
      )
    )
  );

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortOperationsByKind),
      withLatestFrom(
        this.store$.select((state) => state.blockDetails.block),
        this.store$.select((state) => state.blockDetails.kind)
      ),
      map(([action, block, kind]) =>
        actions.loadOperationsByKind({ blockHash: block.hash, kind })
      )
    )
  );

  onLoadTransactionLoadCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationsByKind, actions.loadTransactions),
      map(() => actions.loadOperationsCounts())
    )
  );

  loadTransactionsCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationsCounts),
      withLatestFrom(this.store$.select((state) => state.blockDetails.id)),
      switchMap(([action, address]) =>
        this.apiService.getOperationCount('block_level', address).pipe(
          map(aggregateOperationCounts),
          map((counts) => actions.loadOperationsCountsSucceeded({ counts })),
          catchError((error) =>
            of(actions.loadOperationsCountsFailed({ error }))
          )
        )
      )
    )
  );

  onLoadTransactionsSucceededLoadErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadOperationsByKindSucceeded),
      filter(({ data }) =>
        data.some((transaction) => transaction.status !== 'applied')
      ),
      map(({ data }) => actions.loadTransactionsErrors({ transactions: data }))
    )
  );

  loadTransactionsErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsErrors),
      switchMap(({ transactions }) =>
        this.apiService.getErrorsForOperations(transactions).pipe(
          map((operationErrorsById) =>
            actions.loadTransactionsErrorsSucceeded({ operationErrorsById })
          ),
          catchError((error) =>
            of(actions.loadTransactionsErrorsFailed({ error }))
          )
        )
      )
    )
  );

  changeBlock$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.changeBlock),
        withLatestFrom(this.store$.select((state) => state.blockDetails.id)),
        map(([{ change }, address]) =>
          this.router.navigate([`/block/${Number(address) + change}`])
        )
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly blockService: BlockService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly router: Router,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
