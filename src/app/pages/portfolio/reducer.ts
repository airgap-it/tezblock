import { createReducer, on } from '@ngrx/store';
import * as actions from './actions';
import { Transaction } from '@tezblock/interfaces/Transaction';
import { Account } from '@tezblock/domain/account';
import { Count } from '@tezblock/domain/tab';
import { getTransactionsWithErrors } from '@tezblock/domain/operations';
import { ContractAsset } from '@tezblock/domain/contract';
import { getInitialTableState, sort, TableState } from '@tezblock/domain/table';
import { CollectibleCursor } from '@tezblock/services/collectibles/collectibles.types';

export interface Busy {
  rewardAmount: boolean;
  bakerReward: boolean;
}

export interface BakerTableRatings {
  bakingBadRating: string;
  tezosBakerRating: string;
  stakingCapacity?: number;
}

export interface State {
  address: string;
  account: Account;

  transactions: TableState<Transaction>;
  counts: Count[];
  kind: string;
  busy: Busy;
  contractAssets: TableState<ContractAsset>;
  collectibles: TableState<CollectibleCursor>;
  portofolioValue: string;
}

export const initialState: State = {
  address: undefined,
  account: undefined,

  transactions: getInitialTableState(sort('block_level', 'desc')),
  counts: undefined,
  kind: undefined,

  busy: {
    rewardAmount: false,
    bakerReward: false,
  },
  portofolioValue: undefined,
  contractAssets: getInitialTableState(undefined, Number.MAX_SAFE_INTEGER),
  collectibles: getInitialTableState(undefined, Number.MAX_SAFE_INTEGER),
};

export const reducer = createReducer(
  initialState,
  on(actions.loadAccount, (state, { address }) => ({
    ...state,
    address,
  })),
  on(actions.loadAccountSucceeded, (state, { account }) => ({
    ...state,
    account: account || null,
  })),
  on(actions.loadAccountFailed, (state) => ({
    ...state,
    account: null,
  })),

  on(actions.loadTransactionsByKind, (state, { kind }) => {
    const hasKindChanged = kind !== state.kind;

    return {
      ...state,
      kind,
      transactions: {
        ...state.transactions,
        data: hasKindChanged ? undefined : state.transactions.data,
        loading: true,
      },
    };
  }),
  on(actions.loadTransactionsByKindSucceeded, (state, { data }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      data,
      loading: false,
    },
  })),
  on(actions.loadTransactionsByKindFailed, (state) => ({
    ...state,
    transactions: {
      ...state.transactions,
      loading: false,
    },
  })),
  on(actions.increasePageSize, (state) => ({
    ...state,
    transactions: {
      ...state.transactions,
      pagination: {
        ...state.transactions.pagination,
        currentPage: state.transactions.pagination.currentPage + 1,
      },
    },
  })),
  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      orderBy,
    },
  })),

  on(actions.loadTransactionsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts: (counts || []).concat([
      { key: 'assets', count: state.contractAssets.pagination.total },
      { key: 'collectibles', count: state.collectibles.pagination.total },
    ]),
  })),
  on(
    actions.loadTransactionsErrorsSucceeded,
    (state, { operationErrorsById }) => ({
      ...state,
      transactions: getTransactionsWithErrors(
        operationErrorsById,
        state.transactions
      ),
    })
  ),

  on(actions.loadContractAssets, (state) => ({
    ...state,
    contractAssets: {
      ...state.contractAssets,
      loading: true,
    },
  })),

  on(actions.loadPortfolioValueSucceeded, (state, { data }) => ({
    ...state,
    portofolioValue: data,
  })),

  on(actions.loadCollectiblesSucceeded, (state, { data }) => ({
    ...state,
    collectibles: {
      ...state.collectibles,
      data,
      pagination: {
        ...state.collectibles.pagination,
        currentPage: data.collectibles.length,
      },
      loading: false,
    },
  })),

  on(actions.loadCollectiblesCountSucceeded, (state, { data }) => ({
    ...state,
    counts: (state.counts || [])
      .filter((count) => {
        return count.key !== 'collectibles';
      })
      .concat([{ key: 'collectibles', count: data }]),
    collectibles: {
      ...state.collectibles,
      pagination: {
        ...state.collectibles.pagination,
        total: data,
      },
      loading: false,
    },
  })),

  on(actions.loadCollectiblesFailed, (state) => ({
    ...state,
    collectibles: {
      ...state.collectibles,
      data: null,
      loading: false,
    },
  })),

  on(actions.loadContractAssetsSucceeded, (state, { data }) => ({
    ...state,
    counts: (state.counts || [])
      .filter((count) => {
        return count.key !== 'assets';
      })
      .concat([{ key: 'assets', count: data.length }]),
    contractAssets: {
      ...state.contractAssets,
      data,
      pagination: {
        ...state.contractAssets.pagination,
        total: data.length,
      },
      loading: false,
    },
  })),

  on(actions.wrapAssetsWithTezSucceeded, (state, { data }) => ({
    ...state,
    counts: (state.counts || [])
      .filter((count) => {
        return count.key !== 'assets';
      })
      .concat([{ key: 'assets', count: data.length }]),
    contractAssets: {
      ...state.contractAssets,
      data,
      pagination: {
        ...state.contractAssets.pagination,
        total: data.length,
      },
      loading: false,
    },
  })),
  on(actions.loadContractAssetsFailed, (state) => ({
    ...state,
    contractAssets: {
      ...state.contractAssets,
      data: null,
      loading: false,
    },
  })),

  on(actions.setKind, (state, { kind }) => ({
    ...state,
    kind,
  })),

  on(actions.reset, () => initialState)
);
