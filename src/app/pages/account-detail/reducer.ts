import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'
import { Balance } from '@tezblock/services/api/api.service'
import { range } from 'lodash'
import * as moment from 'moment'

const ensure30Days = (balance: Balance[]): Balance[] => {
  const lastDay = balance && balance.length > 0 ? moment.utc(balance[0].asof).startOf('day') : moment.utc().startOf('day')
  const missingDays = 30 - (moment.utc().startOf('day').diff(lastDay, 'days') + 1)
  const missingBalance: Balance[] = range(0, missingDays).map(index => ({
    balance: 0,
    asof: moment.utc().add(-29 + index, 'days').valueOf()
  }))

  return missingBalance.concat(balance)
}

export interface Busy {
  transactions: boolean
  rewardAmont: boolean
} 

export interface State {
  address: string
  account: Account
  delegatedAccounts: Account[]
  relatedAccounts: Account[]
  transactions: Transaction[]
  kind: string
  pageSize: number // transactions
  rewardAmont: string
  busy: Busy
  balanceFromLast30Days: Balance[]
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
  },
  balanceFromLast30Days: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.loadAccount, (state, { address }) => ({
    ...state,
    address
  })),
  on(actions.loadAccountSucceeded, (state, { account }) => ({
    ...state,
    account: account || null
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
    rewardAmont: null,
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
      transactions: true
    }
  })),
  on(actions.loadTransactionsByKindSucceeded, (state, { data }) => ({
    ...state,
    transactions: data,
    busy: {
      ...state.busy,
      transactions: false
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
  on(actions.loadBalanceForLast30DaysSucceeded, (state, { balanceFromLast30Days }) => ({
    ...state,
    balanceFromLast30Days: ensure30Days(balanceFromLast30Days)
  })),
  on(actions.reset, () => initialState)
)
