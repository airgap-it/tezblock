import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as actions from './actions';
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service';

@Injectable()
export class LiquidityBakingEffects {
  loadChartData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadChartData),
      switchMap(({ from, to }) =>
        this.cryptoPricesService.fetchChartData(from, to).pipe(
          map((chartData) => actions.loadChartDataSucceeded({ chartData })),
          catchError((error) => of(actions.loadChartDataFailed({ error })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly cryptoPricesService: CryptoPricesService
  ) {}
}
