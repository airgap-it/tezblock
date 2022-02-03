import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import * as actions from './actions';
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service';
import BigNumber from 'bignumber.js';

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
      mergeMap(({ referenceSymbol, marketRate }) =>
        forkJoin([
          this.cryptoPricesService.getPrice(referenceSymbol),
          this.cryptoPricesService.getPrice('XTZ'),
        ]).pipe(
          map(([referencePrice, xtzPrice]) => {
            const price = new BigNumber(xtzPrice).times(marketRate);
            const refPrice = new BigNumber(referencePrice);
            return `${price
              .minus(refPrice)
              .dividedBy(refPrice)
              .times(100)
              .toFixed(2)}%`;
          }),
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
