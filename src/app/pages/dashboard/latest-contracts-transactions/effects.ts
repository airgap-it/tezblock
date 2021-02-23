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
          contracts.map((contract) =>
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
          map((response) => flatten(response)),
          map((transferOperations) => {
            return actions.loadTransferOperationsSucceeded({
              transferOperations: transferOperations
                .sort((a, b) => (a.timestamp < b.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0))
                .slice(0, 6)
            })
          }),
          catchError((error) => of(actions.loadTransferOperationsFailed({ error })))
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
