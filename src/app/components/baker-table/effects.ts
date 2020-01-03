import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'

@Injectable()
export class BakerTableEffects {
  paging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increaseRightsPageSize),
      withLatestFrom(this.store$.select(state => state.bakerTable.kind)),
      map(([action, kind]) => (kind === OperationTypes.BakingRights ? actions.loadBakingRights() : actions.loadEndorsingRights()))
    )
  )

  getBakingRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakingRights),
      withLatestFrom(
        this.store$.select(state => state.bakerTable.accountAddress),
        this.store$.select(state => state.bakerTable.bakingRights.pagination)
      ),
      switchMap(([action, accountAddress, pagination]) =>
        this.apiService.getAggregatedBakingRights(accountAddress, pagination.selectedSize * pagination.currentPage).pipe(
          map(bakingRights => actions.loadBakingRightsSucceeded({ bakingRights })),
          catchError(error => of(actions.loadBakingRightsFailed({ error })))
        )
      )
    )
  )

  getEndorsingRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadEndorsingRights),
      withLatestFrom(
        this.store$.select(state => state.bakerTable.accountAddress),
        this.store$.select(state => state.bakerTable.bakingRights.pagination)
      ),
      switchMap(([action, accountAddress, pagination]) =>
        this.apiService.getAggregatedEndorsingRights(accountAddress, pagination.selectedSize * pagination.currentPage).pipe(
          map(endorsingRights => actions.loadEndorsingRightsSucceeded({ endorsingRights })),
          catchError(error => of(actions.loadEndorsingRightsFailed({ error })))
        )
      )
    )
  )

  loadCurrentCycleThenRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCurrentCycleThenRights),
      switchMap(() =>
        this.apiService.getCurrentCycle().pipe(
          map(currentCycle => actions.loadCurrentCycleThenRightsSucceeded({ currentCycle })),
          catchError(error => of(actions.loadBakingRightsFailed({ error })))
        )
      )
    )
  )

  onCurrentCycleLoadRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCurrentCycleThenRightsSucceeded, actions.loadCurrentCycleThenRightsFailed),
      switchMap(() => [actions.loadBakingRights(), actions.loadEndorsingRights()])
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
