import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'

@Injectable()
export class ProposalDetailEffects {

  getProposal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProposal),
      switchMap(({ id }) =>
        this.apiService.getProposal(id).pipe(
          map(proposal => actions.loadProposalSucceeded({ proposal })),
          catchError(error => of(actions.loadProposalFailed({ error })))
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
