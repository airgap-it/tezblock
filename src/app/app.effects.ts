import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, combineLatest } from 'rxjs'
import { catchError, map, switchMap, tap, filter } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { isNil, negate } from 'lodash'

import * as actions from './app.actions'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { Block } from '@tezblock/interfaces/Block'
import { first } from '@tezblock/services/fp'
import * as fromRoot from '@tezblock/reducers'
import { ByCycleState, CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'

@Injectable()
export class AppEffects {
  loadLatestBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestBlock),
      switchMap(() =>
        // replacement for: apiService.getLatestBlocks
        this.baseService
          .post<Block[]>('blocks', {
            orderBy: [
              {
                field: 'timestamp',
                direction: 'desc'
              }
            ],
            limit: 1
          })
          .pipe(
            map(first),
            map(latestBlock => actions.loadLatestBlockSucceeded({ latestBlock })),
            catchError(error => of(actions.loadLatestBlockFailed({ error })))
          )
      )
    )
  )

  onCurrentCycleLoadFirstBlockOfCycle$ = createEffect(() =>
    this.store$.select(fromRoot.app.currentCycle).pipe(
      filter(negate(isNil)),
      map(cycle => actions.loadFirstBlockOfCycle({ cycle }))
    )
  )

  onCurrentCycleChaneResetCache$ = createEffect(
    () =>
      combineLatest(this.store$.select(fromRoot.app.currentCycle), this.cacheService.get<ByCycleState>(CacheKeys.fromCurrentCycle)).pipe(
        filter(([currentCycle, cycleCache]) => currentCycle && (!cycleCache || (cycleCache && cycleCache.cycleNumber !== currentCycle))),
        tap(([currentCycle, cycleCache]) => {
          this.cacheService.set<ByCycleState>(CacheKeys.fromCurrentCycle, { cycleNumber: currentCycle }).subscribe(() => {})
        })
      ),
    { dispatch: false }
  )

  loadFirstBlockOfCycle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadFirstBlockOfCycle),
      switchMap(({ cycle }) =>
        // replacement for: apiService.getCurrentCycleRange
        this.baseService
          .post<Block[]>('blocks', {
            predicates: [
              {
                field: 'meta_cycle',
                operation: Operation.eq,
                set: [cycle],
                inverse: false
              }
            ],
            orderBy: [
              {
                field: 'timestamp',
                direction: 'asc'
              }
            ],
            limit: 1
          })
          .pipe(
            map(first),
            map(firstBlockOfCycle => actions.loadFirstBlockOfCycleSucceeded({ firstBlockOfCycle })),
            catchError(error => of(actions.loadFirstBlockOfCycleFailed({ error })))
          )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly baseService: BaseService,
    private readonly cacheService: CacheService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
