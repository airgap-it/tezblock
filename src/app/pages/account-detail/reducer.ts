import { createReducer, on } from '@ngrx/store'
import { pipe } from 'rxjs'
import { range } from 'lodash'
import * as moment from 'moment'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'
import { Balance } from '@tezblock/services/api/api.service'
import { first, get } from '@tezblock/services/fp'
import { FeeByCycle, BakingBadResponse } from '@tezblock/interfaces/BakingBadResponse'
import { MyTezosBakerResponse } from '@tezblock/interfaces/MyTezosBakerResponse'
import { OrderBy } from '@tezblock/services/base.service'
import { sort } from '@tezblock/domain/table'

const ensure30Days = (balance: Balance[]): Balance[] => {
  const toDay = (index: number): number =>
    moment
      .utc()
      .add(-29 + index, 'days')
      .valueOf()
  const getBalanceFrom = (date: number) => (balanceItem: Balance) =>
    moment(balanceItem.asof)
      .startOf('day')
      .isSame(moment(date).startOf('day'))
  const getPreviousBalance = (balance: Balance[], date: number) => {
    const match = balance.find((balanceItem: Balance) =>
      moment(balanceItem.asof)
        .startOf('day')
        .isBefore(moment(date).startOf('day'))
    )

    return match ? { ...match, asof: date } : undefined
  }
  const attachBalance = (date: number): Balance =>
    balance.find(getBalanceFrom(date)) || getPreviousBalance(balance, date) || { balance: 0, asof: date }

  return range(0, 30).map(
    pipe(
      toDay,
      attachBalance
    )
  )
}

const ratingNumberToLabel = [
  /* 0 */ 'awesome',
  /* 1 */ 'so-so',
  /* 2 */ 'dead',
  /* 3 */ 'specific',
  /* 4 */ 'hidden',
  /* 5 */ 'new',
  /* 6 */ undefined,
  /* 7 */ undefined,
  /* 8 */ undefined,
  /* 9 */ 'unknown'
]

const extractFee = pipe<FeeByCycle[], FeeByCycle, number>(
  first,
  get(feeByCycle => feeByCycle.value * 100)
)

export const fromBakingBadResponse = (response: BakingBadResponse, state: State): actions.BakingRatingResponse => ({
  bakingRating:
    response.status === 'success' && ratingNumberToLabel[response.rating.status] ? ratingNumberToLabel[response.rating.status] : null,
  tezosBakerFee: response.status === 'success' ? extractFee(response.config.fee) : null
})

export const fromMyTezosBakerResponse = (
  response: MyTezosBakerResponse,
  state: State,
  updateFee: boolean
): actions.BakingRatingResponse => ({
  bakingRating:
    response.status === 'success' && response.rating
      ? (Math.round((Number(response.rating) + 0.00001) * 100) / 100).toString() + ' %'
      : null,
  tezosBakerFee: updateFee ? (response.status === 'success' && response.fee ? parseFloat(response.fee) : null) : state.tezosBakerFee
})

export interface Busy {
  transactions: boolean
  rewardAmont: boolean
}

export interface BakerTableRatings {
  bakingBadRating: string
  tezosBakerRating: string
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
  bakerTableRatings: BakerTableRatings
  tezosBakerFee: number
  orderBy: OrderBy
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
  balanceFromLast30Days: undefined,
  bakerTableRatings: undefined,
  tezosBakerFee: undefined,
  orderBy: sort('block_level', 'desc')
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

  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    orderBy
  })),

  on(actions.loadBalanceForLast30DaysSucceeded, (state, { balanceFromLast30Days }) => ({
    ...state,
    balanceFromLast30Days: ensure30Days(balanceFromLast30Days)
  })),
  on(actions.loadBakingBadRatingsSucceeded, (state, { response }) => ({
    ...state,
    bakerTableRatings: {
      ...state.bakerTableRatings,
      bakingBadRating: response.bakingRating
    },
    tezosBakerFee: response.tezosBakerFee,
    busy: {
      ...state.busy,
      bakerTableRatings: false
    }
  })),
  on(actions.loadTezosBakerRatingSucceeded, (state, { response }) => ({
    ...state,
    bakerTableRatings: {
      ...state.bakerTableRatings,
      tezosBakerRating: response.bakingRating
    },
    tezosBakerFee: response.tezosBakerFee,
    busy: {
      ...state.busy,
      bakerTableRatings: false
    }
  })),

  on(actions.reset, () => initialState)
)
