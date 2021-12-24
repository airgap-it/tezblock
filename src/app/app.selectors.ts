import { createSelector } from '@ngrx/store';
import { selectApp } from './reducers';

export const getConnectedWallet = createSelector(
  selectApp,
  (state) => state.connectedWallet
);
export const getConnectedWalletBalance = createSelector(
  selectApp,
  (state) => state.connectedWalletBalance
);

export const getSelectedSlippage = createSelector(
  selectApp,
  (state) => state.selectedSlippage
);
