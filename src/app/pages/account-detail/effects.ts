import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { RewardService } from '@tezblock/services/reward/reward.service'
import * as fromRoot from '@tezblock/reducers'

@Injectable()
export class AccountDetailEffects {
  getDoubleBakings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRewardAmont),
      switchMap(action =>
        this.rewardService.getRewardAmont(action.accountAddress, action.bakerAddress).pipe(
          map(rewardAmont => actions.loadRewardAmontSucceeded({ rewardAmont })),
          catchError(error => of(actions.loadRewardAmontFailed({ error })))
        )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
