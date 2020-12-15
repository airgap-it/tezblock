import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, forkJoin, pipe, from } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as listActions from './actions'
import { ApiService, Baker } from '@tezblock/services/api/api.service'
import { BaseService, maxLimit } from '@tezblock/services/base.service'
import * as fromRoot from '@tezblock/reducers'
import { othersBakersLabel } from './reducer'
import { first, get } from '@tezblock/services/fp'

const addOthersStakingBalance = ([top24Bakers, wholeStakingBalance]: [Baker[], { sum_staking_balance: number }[]]): Baker[] =>
  top24Bakers.concat({
    pkh: othersBakersLabel,
    block_level: null,
    delegated_balance: null,
    balance: null,
    deactivated: null,
    staking_balance: pipe<{ sum_staking_balance: number }[], any, number, number>(
      first,
      get(_first => _first.sum_staking_balance),
      sum_staking_balance => sum_staking_balance - top24Bakers.map(baker => baker.staking_balance).reduce((a, b) => a + b)
    )(wholeStakingBalance),
    block_id: null,
    frozen_balance: null,
    grace_period: null
  })

@Injectable()
export class BakersEffects {
  activeBakersPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfActiveBakers),
      map(() => listActions.loadActiveBakers())
    )
  )

  getActiveBakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActiveBakers),
      withLatestFrom(
        this.store$.select(state => state.bakers.activeBakers.pagination),
        this.store$.select(state => state.bakers.activeBakers.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) =>
        this.apiService.getActiveBakers(pagination.selectedSize * pagination.currentPage, orderBy).pipe(
          switchMap(activeBakers =>
            this.apiService.getNumberOfDelegatorsByBakers(activeBakers.map(activeBaker => activeBaker.pkh)).pipe(
              map(numberOfDelegatorsByBakers =>
                listActions.loadActiveBakersSucceeded({
                  activeBakers: activeBakers.map(activeBaker => {
                    const match = numberOfDelegatorsByBakers.find(item => item.delegate_value == activeBaker.pkh)
                    const number_of_delegators = match ? match.number_of_delegators : null

                    return {
                      ...activeBaker,
                      number_of_delegators
                    }
                  })
                })
              ),
              catchError(error => of(listActions.loadActiveBakersFailed({ error })))
            )
          )
        )
      )
    )
  )

  loadTop24Bakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTop24Bakers),
      switchMap(() =>
        forkJoin(
          this.apiService.getActiveBakers(24),
          this.baseService.post('bakers'/* delegates (previously) */, {
            fields: ['staking_balance'],
            aggregation: [
              {
                field: 'staking_balance',
                function: 'sum'
              }
            ],
            limit: maxLimit
          })
        ).pipe(
          map(addOthersStakingBalance),
          map(top24Bakers => listActions.loadTop24BakersSucceeded({ top24Bakers })),
          catchError(error => of(listActions.loadTop24BakersFailed({ error })))
        )
      )
    )
  )

  getTotalActiveBakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTotalActiveBakers),
      switchMap(() =>
        this.apiService.getTotalBakersAtTheLatestBlock().pipe(
          map(totalActiveBakers => listActions.loadTotalActiveBakersSucceeded({ totalActiveBakers })),
          catchError(error => of(listActions.loadTotalActiveBakersFailed({ error })))
        )
      )
    )
  )

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortActiveBakersByKind),
      map(() => listActions.loadActiveBakers())
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
