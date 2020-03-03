import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, forkJoin, from } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { TezosTransactionResult } from 'airgap-coin-lib'
import { BaseService } from '@tezblock/services/base.service'
import { Operation } from '@tezblock/services/base.service'
import { sort } from '@tezblock/domain/table'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { flatten } from '@tezblock/services/fp'
import { airGapTransactionToContractOperation } from '@tezblock/domain/contract'
import { Transaction } from '@tezblock/interfaces/Transaction'

const toCustomContractOperations = (data: TezosTransactionResult, symbol: string): actions.CustomContractOperation[] =>
  data.transactions.map(transaction => ({
    ...airGapTransactionToContractOperation(transaction),
    symbol
  }))

const fillAmountAndSymbol = (opearations: Transaction[], airgapOperations: actions.CustomContractOperation[]): Transaction[] =>
  opearations.map(operation => {
    const match = airgapOperations.find(airgapOperation => airgapOperation.hash === operation.operation_group_hash)

    return {
      ...operation,
      amount: match ? parseFloat(match.amount) : operation.amount,
      symbol: match ? match.symbol : operation.symbol
    }
  })

@Injectable()
export class DashboardLatestContractsTransactionsEffects {
  loadTransferOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransferOperations),
      switchMap(({ contracts }) =>
        forkJoin(
          contracts.map(contract =>
            this.apiService
              .getTransferOperationsForContract(contract)
              .pipe(map(result => toCustomContractOperations(result, contract.symbol).slice(0, 3)))
          )
        ).pipe(
          map(response => flatten(response)),
          switchMap(transferOperations =>
            this.baseService
              .post<Transaction[]>('operations', {
                predicates: transferOperations.map((operation, index) => ({
                  field: 'operation_group_hash',
                  operation: Operation.eq,
                  set: [operation.hash],
                  inverse: false,
                  group: `A${index}`
                })),
                orderBy: [sort('block_level', 'desc')]
              })
              .pipe(
                map(transactions =>
                  actions.loadTransferOperationsSucceeded({
                    transferOperations: fillAmountAndSymbol(transactions.slice(0, 6), transferOperations)
                  })
                ),
                catchError(error => of(actions.loadTransferOperationsFailed({ error })))
              )
          )
        )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
