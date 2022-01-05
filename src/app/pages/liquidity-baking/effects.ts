import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import * as actions from './actions';
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service';

@Injectable()
export class LiquidityBakingEffects {
  loadChartData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadChartData),
      mergeMap(({ from, to }) =>
        this.cryptoPricesService.fetchChartData(from, to).pipe(
          map((chartData) => actions.loadChartDataSucceeded({ chartData })),
          catchError((error) => of(actions.loadChartDataFailed({ error })))
        )
      )
    )
  );

  calculatePriceDelta$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.calculatePriceDelta),
      mergeMap(({ symbol, referenceSymbol }) =>
        this.cryptoPricesService
          .calculatePriceDelta(symbol, referenceSymbol)
          .pipe(
            map((priceDelta) =>
              actions.calculatePriceDeltaSucceeded({ priceDelta })
            ),
            catchError((error) =>
              of(actions.calculatePriceDeltaFailed({ error }))
            )
          )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly cryptoPricesService: CryptoPricesService
  ) {}
}
