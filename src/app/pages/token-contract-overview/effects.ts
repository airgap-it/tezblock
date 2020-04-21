import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { forkJoin, of } from 'rxjs'
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators'

import { getTokenContracts } from '@tezblock/domain/contract'
import * as fromRoot from '@tezblock/reducers'
import { ApiService } from '@tezblock/services/api/api.service'
import * as listActions from './actions'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

@Injectable()
export class TokenContractOverviewEffects {

  loadTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTokenContracts),
      withLatestFrom(this.store$.select(state => state.list.doubleEndorsements.pagination)),
      switchMap(([action, pagination]) => {
        const contracts = getTokenContracts(this.chainNetworkService.getNetwork(), pagination.currentPage * pagination.selectedSize)

        if (!contracts || contracts.total === 0) {
          return of(listActions.loadTokenContractsSucceeded({ tokenContracts: { data: [], total: 0 } }))
        }

        return forkJoin(contracts.data.map(contract => this.apiService.getTotalSupplyByContract(contract))).pipe(
          map(totalSupplies =>
            listActions.loadTokenContractsSucceeded({
              tokenContracts: {
                data: totalSupplies.map((totalSupply, index) => ({ ...contracts.data[index], totalSupply })),
                total: contracts.total
              }
            })
          ),
          catchError(error => of(listActions.loadTokenContractsFailed({ error })))
        )
      })
    )
  )

  increasePageOfTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfTokenContracts),
      map(() => listActions.loadTokenContracts())
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
