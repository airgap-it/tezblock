import { createReducer, on } from '@ngrx/store';

import * as actions from './actions';
import { CryptoPriceApiResponse } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { ContractAsset } from '../account-detail/model';
import { AccountInfo } from '@airgap/beacon-sdk';

export interface State {
  chartData: CryptoPriceApiResponse[];
  contractAssets: ContractAsset[];
  priceDelta: string;
  connectedWallet: AccountInfo | undefined;
}

export const initialState: State = {
  chartData: [],
  contractAssets: [],
  connectedWallet: undefined,
  priceDelta: '',
};

export const reducer = createReducer(
  initialState,
  on(actions.loadChartDataSucceeded, (state, { chartData }) => ({
    ...state,
    chartData,
  })),
  on(actions.calculatePriceDeltaSucceeded, (state, { priceDelta }) => ({
    ...state,
    priceDelta,
  }))
);
