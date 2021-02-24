import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { getTokenContracts } from '@tezblock/domain/contract'
import * as fromRoot from '@tezblock/reducers'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { ContractService } from '@tezblock/services/contract/contract.service'
import { forkJoin, of } from 'rxjs'
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators'

import * as listActions from './actions'

@Injectable()
export class TokenContractOverviewEffects {

  public loadTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTokenContracts),
      withLatestFrom(this.store$.select(state => state.list.doubleEndorsements.pagination)),
      switchMap(([action, pagination]) => {
        const contracts = getTokenContracts(this.chainNetworkService.getNetwork(), pagination.currentPage * pagination.selectedSize)

        if (!contracts || contracts.total === 0) {
          return of(listActions.loadTokenContractsSucceeded({ tokenContracts: { data: [], total: 0 } }))
        }

        return forkJoin(contracts.data.map(contract => this.contractService.getTotalSupplyByContract(contract))).pipe(
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

  public increasePageOfTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfTokenContracts),
      map(() => listActions.loadTokenContracts())
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly contractService: ContractService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
