import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { forkJoin, of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom, delay } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as moment from 'moment'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { OperationTypes } from '@tezblock/domain/operations'
import { BakingService } from '@tezblock/services/baking/baking.service'
import { BaseService, Body, Operation } from '@tezblock/services/base.service'
import { Block } from '@tezblock/interfaces/Block'
import { first } from '@tezblock/services/fp'

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

  loadEfficiencyLast10Cycles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadEfficiencyLast10Cycles),
      withLatestFrom(this.store$.select(state => state.bakerTable.accountAddress)),
      switchMap(([action, accountAddress]) =>
        this.bakingService.getEfficiencyLast10Cycles(accountAddress).pipe(
          map(efficiencyLast10Cycles => actions.loadEfficiencyLast10CyclesSucceeded({ efficiencyLast10Cycles })),
          catchError(error => of(actions.loadEfficiencyLast10CyclesFailed({ error })))
        )
      )
    )
  )

  loadUpcomingRights$ = createEffect(() => {
    const body = (address: string, /*blockLevel: number,*/ endorsing?: boolean): Body => ({
      fields: ['estimated_time', 'level'],
      predicates: [
        { field: 'estimated_time', operation: Operation.after, set: [moment.utc().valueOf()], inverse: false },
        //{ field: 'level', operation: 'gt', set: [blockLevel], inverse: false },
        { field: 'delegate', operation: Operation.eq, set: [address], inverse: false }
      ].concat(endorsing ? [] : { field: 'priority', operation: Operation.eq, set: ['0'], inverse: false }),
      orderBy: [{ field: 'estimated_time', direction: 'asc' }],
      limit: 1
    })

    return this.actions$.pipe(
      ofType(actions.loadUpcomingRights),
      withLatestFrom(this.store$.select(state => state.accountDetails.address)),
      // switchMap(([action, accountAddress]) =>
      //   this.apiService.getLatestBlocks(1).pipe(
      //     map(first),
      //     map<Block, [string, Block]>(block => [accountAddress, block])
      //   )
      // ),
      switchMap(([action, accountAddress]) =>
        forkJoin(
          this.baseService.post<any>('baking_rights', body(accountAddress)).pipe(
            map(first)
          ),
          this.baseService.post<any>('endorsing_rights', body(accountAddress, true)).pipe(
            map(first)
          )
        ).pipe(
          map(([baking, endorsing]: [any, any]) =>
            actions.loadUpcomingRightsSucceeded({ upcomingRights: { baking, endorsing } })
          ),
          catchError(error => of(actions.loadUpcomingRightsFailed({ error })))
        )
      )
    )
  })

  loadUpcomingRightsRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUpcomingRightsSucceeded),
      switchMap(({ upcomingRights }) => {
        const nextChange = Math.min(upcomingRights.baking.estimated_time, upcomingRights.endorsing.estimated_time)
        const changeInMilliseconds = moment.utc(nextChange).diff(moment.utc(), 'milliseconds')

        return of(null).pipe(
          delay(changeInMilliseconds),
          map(() => actions.loadUpcomingRights())
        )
      })
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly bakingService: BakingService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
