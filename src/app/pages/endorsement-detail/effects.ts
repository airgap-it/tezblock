import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'

import * as EndorsementDetailActions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import { Transaction } from '@tezblock/interfaces/Transaction'

@Injectable()
export class EndorsementDetailEffects {
  getEndorsementDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsementDetails),
      switchMap(({ id }) =>
        this.apiService.getEndorsementsById(id, 1).pipe(
          map((endorsements: Transaction[]) => EndorsementDetailActions.loadEndorsementDetailsSucceeded({ endorsement: endorsements[0] })),
          catchError(error => of(EndorsementDetailActions.loadEndorsementDetailsFailed({ error })))
        )
      )
    )
  )

  onEndorsementIdTriggerGetEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsementDetailsSucceeded),
      map(({ endorsement }) => EndorsementDetailActions.loadEndorsements({ blockHash: endorsement.block_hash }))
    )
  )

  getEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EndorsementDetailActions.loadEndorsements),
      switchMap(({ blockHash }) =>
        this.apiService.getTransactionsByField(blockHash, 'block_hash', 'endorsement', 100).pipe(
          map((endorsements: Transaction[]) => EndorsementDetailActions.loadEndorsementsSucceeded({ endorsements })),
          catchError(error => of(EndorsementDetailActions.loadEndorsementsFailed({ error })))
        )
      )
    )
  )

  constructor(private actions$: Actions, private apiService: ApiService) {}
}
