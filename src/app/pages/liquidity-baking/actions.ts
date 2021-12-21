import { createAction, props } from '@ngrx/store';
import { CryptoPriceApiResponse } from '@tezblock/services/crypto-prices/crypto-prices.service';

const featureName = 'Liquidity Baking';

export const loadChartData = createAction(
  `[${featureName}] Load Chart Data`,
  props<{ from: string; to: string }>()
);
export const loadChartDataSucceeded = createAction(
  `[${featureName}] Load Chart Data Succeeded`,
  props<{ chartData: CryptoPriceApiResponse[] }>()
);
export const loadChartDataFailed = createAction(
  `[${featureName}] Load Chart Data Failed`,
  props<{ error: any }>()
);

export const reset = createAction(`[${featureName}] Reset`);
