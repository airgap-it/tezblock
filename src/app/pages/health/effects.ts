import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as actions from './actions';
import { HealthService } from '@tezblock/services/health/health.service';
import * as fromRoot from '@tezblock/reducers';

@Injectable()
export class HealthEffects {
  loadLatestNodeBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestNodeBlock),
      switchMap(() =>
        this.healthService.loadLatestNodeBlock().pipe(
          map((latestNodeBlock) =>
            actions.loadLatestNodeBlockSucceeded({ latestNodeBlock })
          ),
          catchError((error) =>
            of(actions.loadLatestNodeBlockFailed({ error }))
          )
        )
      )
    )
  );

  loadLatestConseilBlock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadLatestConseilBlock),
      switchMap(() =>
        this.healthService.loadLatestConseilBlock().pipe(
          map((latestConseilBlock) =>
            actions.loadLatestConseilBlockSucceeded({ latestConseilBlock })
          ),
          catchError((error) =>
            of(actions.loadLatestConseilBlockFailed({ error }))
          )
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly healthService: HealthService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
