import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, pipe } from 'rxjs'
import { map, catchError, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'

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
        this.store$.select(state => state.transactionDetails.transactions.pagination),
        this.store$.select(state => state.transactionDetails.transactions.orderBy)
      ),
      switchMap(([{ transactionHash }, pagination, orderBy]) =>
        this.apiService.getTransactionsById(transactionHash, pagination.currentPage * pagination.selectedSize, orderBy).pipe(
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

  onLoadTransactionsByHashLoadTotalAmountAndFee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByHash),
      switchMap(() => [actions.loadTransactionsTotalAmount() /*, actions.loadTransactionsTotalFee()*/])
    )
  )

  loadTransactionsTotalAmount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsTotalAmount),
      withLatestFrom(this.store$.select(state => state.transactionDetails.transactionHash)),
      switchMap(([action, address]) =>
        this.baseService
          .post<any[]>('operations', {
            fields: ['amount'],
            predicates: [
              {
                field: 'operation_group_hash',
                operation: Operation.eq,
                set: [address],
                inverse: false
              },
              {
                field: 'kind',
                operation: Operation.eq,
                set: ['transaction']
              }
            ],
            aggregation: [
              {
                field: 'amount',
                function: 'sum'
              }
            ]
          })
          .pipe(
            map(
              pipe(
                first,
                get<any>(item => parseInt(item.sum_amount))
              )
            ),
            map(totalAmount => actions.loadTransactionsTotalAmountSucceeded({ totalAmount })),
            catchError(error => of(actions.loadTransactionsTotalAmountFailed({ error })))
          )
      )
    )
  )

  loadTransactionsTotalFee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsTotalFee),
      withLatestFrom(this.store$.select(state => state.transactionDetails.transactionHash)),
      switchMap(([action, address]) =>
        this.baseService
          .post<any[]>('operations', {
            fields: ['fee'],
            predicates: [
              {
                field: 'operation_group_hash',
                operation: Operation.eq,
                set: [address],
                inverse: false
              }
            ],
            aggregation: [
              {
                field: 'fee',
                function: 'sum'
              }
            ]
          })
          .pipe(
            map(
              pipe(
                first,
                get<any>(item => parseInt(item.sum_fee))
              )
            ),
            map(totalFee => actions.loadTransactionsTotalFeeSucceeded({ totalFee })),
            catchError(error => of(actions.loadTransactionsTotalFeeFailed({ error })))
          )
      )
    )
  )

  onLoadTransactionsSucceededLoadErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByHashSucceeded),
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

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly blockService: NewBlockService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
