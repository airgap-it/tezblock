import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, Observable, forkJoin } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'
import { getContracts } from '@tezblock/domain/contract'

@Injectable()
export class DashboardLatestContractsEffects {

  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContracts),
      withLatestFrom(this.store$.select(state => state.list.doubleEndorsements.pagination)),
      switchMap(([action, pagination]) => {
        const contracts = getContracts(pagination.currentPage * pagination.selectedSize)

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

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
