import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, forkJoin } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { TezosTransactionResult } from 'airgap-coin-lib'
import { BaseService } from '@tezblock/services/base.service'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { flatten } from '@tezblock/services/fp'
import { airGapTransactionToContractOperation, ContractOperation, TokenContract } from '@tezblock/domain/contract'

const toContractOperations = (data: TezosTransactionResult, contract: TokenContract): ContractOperation[] =>
  data.transactions.map(transaction => ({
    ...airGapTransactionToContractOperation(transaction),
    symbol: contract.symbol,
    decimals: contract.decimals
  }))

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
              .pipe(map(result => toContractOperations(result, contract).slice(0, 3)))
          )
        ).pipe(
          map(response => flatten(response)),
          map(transferOperations =>
            actions.loadTransferOperationsSucceeded({
              transferOperations: transferOperations.slice(0, 6)
            })
          ),
          catchError(error => of(actions.loadTransferOperationsFailed({ error })))
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
