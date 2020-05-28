import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, forkJoin } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { flatten } from '@tezblock/services/fp'
import { ContractService } from '@tezblock/services/contract/contract.service'

@Injectable()
export class DashboardLatestContractsTransactionsEffects {
  loadTransferOperations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransferOperations),
      switchMap(({ contracts }) =>
        forkJoin(
          contracts.map(contract =>
            this.contractService.loadTransferOperations(
              contract,
              {
                field: 'block_level',
                direction: 'desc'
              },
              3
            )
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
    private readonly contractService: ContractService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
