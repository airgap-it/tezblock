import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as listActions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'

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
      withLatestFrom(this.store$.select(state => state.list.activeBakers.pagination)),
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

  proposalsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfProposals),
      map(() => listActions.loadProposals())
    )
  )

  getProposals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadProposals),
      withLatestFrom(this.store$.select(state => state.list.proposals.pagination)),
      switchMap(([action, pagination]) =>
        this.apiService.getProposals(pagination.selectedSize * pagination.currentPage).pipe(
          map(proposals => listActions.loadProposalsSucceeded({ proposals })),
          catchError(error => of(listActions.loadProposalsFailed({ error })))
        )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
