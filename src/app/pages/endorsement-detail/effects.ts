import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, pipe } from 'rxjs'
import { filter, map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as _ from 'lodash'

import * as EndorsementDetailActions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'

const takeSecond = ([first, second]) => second
const areSlots = (endorsements: Transaction[]) => endorsements !== undefined

@Injectable()
export class EndorsementDetailEffects {
  onUrlChangeGetEndorsementDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsementDetails),
      withLatestFrom(this.store$.select(state => state.endorsementDetails.endorsements)),
      filter(pipe(takeSecond, _.negate(areSlots))),
      map(([action, endorsements]) => action),
      switchMap(({ id }) =>
        this.apiService.getEndorsementsById(id, 1).pipe(
          map((endorsements: Transaction[]) => EndorsementDetailActions.loadEndorsementDetailsSucceeded({ endorsement: endorsements[0] })),
          catchError(error => of(EndorsementDetailActions.loadEndorsementDetailsFailed({ error })))
        )
      )
    )
  )

  onUrlChangeSelectEndorsement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsementDetails),
      withLatestFrom(this.store$.select(state => state.endorsementDetails.endorsements)),
      filter(pipe(takeSecond, areSlots)),
      map(([action, endorsements]) => EndorsementDetailActions.slotSelected({ operation_group_hash: action.id }))
    )
  )

  onEndorsementTriggerGetEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsementDetailsSucceeded),
      map(({ endorsement }) => EndorsementDetailActions.loadEndorsements())
    )
  )

  getEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsements),
      withLatestFrom(this.store$.select(state => state.endorsementDetails.selectedEndorsement)),
      filter(([action, endorsement]) => !!endorsement),
      switchMap(([action, endorsement]) =>
        this.apiService.getTransactionsByField(endorsement.block_hash, 'block_hash', 'endorsement', 100).pipe(
          map((endorsements: Transaction[]) => EndorsementDetailActions.loadEndorsementsSucceeded({ endorsements })),
          catchError(error => of(EndorsementDetailActions.loadEndorsementsFailed({ error })))
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
