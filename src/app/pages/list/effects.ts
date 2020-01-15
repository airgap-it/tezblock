import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, Observable } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as moment from 'moment'

import * as listActions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import { BaseService } from '@tezblock/services/base.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'

const getTimestamp24hAgo = (): number =>
  moment()
    .add(-24, 'hours')
    .valueOf()

@Injectable()
export class ListEffects {
  doubleBakingsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfDoubleBakings),
      map(() => listActions.loadDoubleBakings())
    )
  )

  getDoubleBakings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadDoubleBakings),
      withLatestFrom(this.store$.select(state => state.list.doubleBakings.pagination)),
      switchMap(([action, pagination]) =>
        this.apiService.getLatestTransactions(pagination.selectedSize * pagination.currentPage, ['double_baking_evidence']).pipe(
          map((doubleBakings: Transaction[]) => listActions.loadDoubleBakingsSucceeded({ doubleBakings })),
          catchError(error => of(listActions.loadDoubleBakingsFailed({ error })))
        )
      )
    )
  )

  doubleEndorsementsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfDoubleEndorsements),
      map(() => listActions.loadDoubleEndorsements())
    )
  )

  getDoubleEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadDoubleEndorsements),
      withLatestFrom(this.store$.select(state => state.list.doubleEndorsements.pagination)),
      switchMap(([action, pagination]) =>
        this.apiService.getLatestTransactions(pagination.selectedSize * pagination.currentPage, ['double_endorsement_evidence']).pipe(
          map((doubleEndorsements: Transaction[]) => listActions.loadDoubleEndorsementsSucceeded({ doubleEndorsements })),
          catchError(error => of(listActions.loadDoubleEndorsementsFailed({ error })))
        )
      )
    )
  )

  activeBakersPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfActiveBakers),
      map(() => listActions.loadActiveBakers())
    )
  )

  getActiveBakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActiveBakers),
      withLatestFrom(this.store$.select(state => state.list.activeBakers.table.pagination)),
      switchMap(([action, pagination]) =>
        this.apiService.getActiveBakers(pagination.selectedSize * pagination.currentPage).pipe(
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

  loadActivationsCountLast24h$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActivationsCountLast24h),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp24hAgo(), 'activate_account').pipe(
          map(activations => activations.length),
          map(activationsCountLast24h => listActions.loadActivationsCountLast24hSucceeded({ activationsCountLast24h })),
          catchError(error => of(listActions.loadActivationsCountLast24hFailed({ error })))
        )
      )
    )
  )

  loadOriginationsCountLast24h$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadOriginationsCountLast24h),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp24hAgo(), 'origination').pipe(
          map(originations => originations.length),
          map(originationsCountLast24h => listActions.loadOriginationsCountLast24hSucceeded({ originationsCountLast24h })),
          catchError(error => of(listActions.loadOriginationsCountLast24hFailed({ error })))
        )
      )
    )
  )

  loadTransactionsCountLast24h$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTransactionsCountLast24h),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp24hAgo(), 'transaction').pipe(
          map(transactions => transactions.length),
          map(transactionsCountLast24h => listActions.loadTransactionsCountLast24hSucceeded({ transactionsCountLast24h })),
          catchError(error => of(listActions.loadTransactionsCountLast24hFailed({ error })))
        )
      )
    )
  )

  private getEntitiesSince(since: number, kind: string): Observable<Transaction[]> {
    return this.baseService.post<Transaction[]>('operations', {
      fields: ['timestamp'],
      predicates: [
        { field: 'operation_group_hash', operation: 'isnull', inverse: true },
        { field: 'kind', operation: 'in', set: [kind] },
        { field: 'timestamp', operation: 'gt', set: [since] }
      ],
      orderBy: [{ field: 'timestamp', direction: 'asc' }],
      limit: 100000
    })
  }

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
