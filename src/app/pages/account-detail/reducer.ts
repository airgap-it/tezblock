import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'

export interface Busy {
  transactions: boolean
  rewardAmont: boolean
}

export interface State {
  address: string
  account: Account
  delegatedAccounts: Account[],
  relatedAccounts: Account[],
  transactions: Transaction[]
  kind: string
  pageSize: number // transactions
  rewardAmont: string
  busy: Busy
}

const initialState: State = {
  address: undefined,
  account: undefined,
  delegatedAccounts: undefined,
  relatedAccounts: undefined,
  transactions: undefined,
  kind: undefined,
  pageSize: 10,
  rewardAmont: undefined,
  busy: {
    transactions: false,
    rewardAmont: false
  }
}

export const reducer = createReducer(
  initialState,
  on(actions.loadAccount, (state, { address }) => ({
    ...state,
    address
  })),
  on(actions.loadAccountSucceeded, (state, { account }) => ({
    ...state,
    account
  })),
  on(actions.loadAccountFailed, state => ({
    ...state,
    account: null
  })),
  on(actions.loadDelegatedAccountsSucceeded, (state, { accounts }) => ({
    ...state,
    delegatedAccounts: accounts.delegated,
    relatedAccounts: accounts.related
  })),
  on(actions.loadRewardAmont, state => ({
    ...state,
    busy: {
      ...state.busy,
      rewardAmont: true
    }
  })),
  on(actions.loadRewardAmontSucceeded, (state, { rewardAmont }) => ({
    ...state,
    rewardAmont,
    busy: {
      ...state.busy,
      rewardAmont: false
    }
  })),
  on(actions.loadRewardAmontFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      rewardAmont: false
    }
  })),
  on(actions.loadTransactionsByKind, (state, { kind }) => ({
    ...state,
    kind,
    busy: {
      ...state.busy,
      data: true
    }
  })),
  on(actions.loadTransactionsByKindSucceeded, (state, { data }) => ({
    ...state,
    transactions: data,
    busy: {
      ...state.busy,
      data: false
    }
  })),
  on(actions.loadTransactionsByKindFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      transactions: false
    }
  })),
  on(actions.increasePageSize, state => ({
    ...state,
    pageSize: state.pageSize + 10
  })),
  on(actions.reset, () => initialState)
)
