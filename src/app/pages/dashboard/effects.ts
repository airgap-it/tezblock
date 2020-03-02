import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, Observable, forkJoin } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { getTokenContracts } from '@tezblock/domain/contract'
import { first } from '@tezblock/services/fp'

@Injectable()
export class DashboarEffects {

  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContracts),
      switchMap(() => {
        const contracts = getTokenContracts(6)

        if (!contracts || contracts.total === 0) {
            return of(actions.loadContractsSucceeded({ contracts: [] }))
        }

        return forkJoin(contracts.data.map(contract => this.apiService.getTotalSupplyByContract(contract))).pipe(
          map(totalSupplies =>
            actions.loadContractsSucceeded({
              contracts: totalSupplies.map((totalSupply, index) => ({ ...contracts.data[index], totalSupply }))
            })
          ),
          catchError(error => of(actions.loadContractsFailed({ error })))
        )
      })
    )
  )

  loadLatestProposal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestProposal),
      switchMap(() => {
        return this.apiService.getProposals(1).pipe(
          map(first),
          map(proposal => actions.loadLatestProposalSucceeded({ proposal })),
          catchError(error => of(actions.loadLatestProposalFailed({ error })))
        )
      })
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
