import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as fromRoot from '@tezblock/reducers';
import { ContractService } from '@tezblock/services/contract/contract.service';
import { of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import * as listActions from './actions';

@Injectable()
export class TokenContractOverviewEffects {
  public loadTokenAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTokenAssets),
      withLatestFrom(
        this.store$.select(
          (state) => state.tokenContractOverview.tokenAssets.pagination
        )
      ),
      switchMap(([_action, pagination]) => {
        return this.contractService
          .fetchContractAssets(pagination.currentPage, pagination.selectedSize)
          .pipe(
            switchMap((assets) => {
              return of(
                listActions.loadTokenAssetsSucceeded({
                  tokenAssets: { data: assets, total: 10000 },
                })
              );
            })
          );
      })
    )
  );

  public increasePageOfTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfTokenContracts),
      map(() => listActions.loadTokenAssets())
    )
  );
  constructor(
    private readonly actions$: Actions,
    private readonly contractService: ContractService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
