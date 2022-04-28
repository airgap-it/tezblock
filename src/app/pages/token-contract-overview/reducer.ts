import { createReducer, on } from '@ngrx/store';
import * as actions from './actions';
import { getInitialTableState, TableState } from '@tezblock/domain/table';
import { TokenAsset } from '@tezblock/services/contract/contract.service';

export interface State {
  tokenAssets: TableState<TokenAsset>;
}

export const initialState: State = {
  tokenAssets: getInitialTableState(),
};

export const reducer = createReducer(
  initialState,
  on(actions.loadTokenAssets, (state) => ({
    ...state,
    tokenAssets: {
      ...state.tokenAssets,
      loading: true,
    },
  })),
  on(actions.loadTokenAssetsSucceeded, (state, { tokenAssets }) => ({
    ...state,
    tokenAssets: {
      ...state.tokenAssets,
      data: tokenAssets.data,
      pagination: {
        ...state.tokenAssets.pagination,
        total: tokenAssets.total,
      },
      loading: false,
    },
  })),
  on(actions.loadTokenContractsFailed, (state) => ({
    ...state,
    tokenAssets: {
      ...state.tokenAssets,
      data: null,
      loading: false,
    },
  })),
  on(actions.increasePageOfTokenContracts, (state) => ({
    ...state,
    tokenAssets: {
      ...state.tokenAssets,
      pagination: {
        ...state.tokenAssets.pagination,
        currentPage: state.tokenAssets.pagination.currentPage + 1,
      },
    },
  })),
  on(actions.reset, () => initialState)
);
