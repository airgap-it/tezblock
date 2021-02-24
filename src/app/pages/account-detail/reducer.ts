import { createReducer, on } from '@ngrx/store'
import { pipe } from 'rxjs'
import { range } from 'lodash'
import moment from 'moment'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/domain/account'
import { Balance } from '@tezblock/services/api/api.service'
import { first, get } from '@tezblock/services/fp'
import { FeeByCycle, BakingBadResponse } from '@tezblock/interfaces/BakingBadResponse'
import { Count } from '@tezblock/domain/tab'
import { getTransactionsWithErrors } from '@tezblock/domain/operations'
import { BakingRatingResponse, ContractAsset } from './model'
import { xtzToMutezConvertionRatio } from '@tezblock/domain/airgap'

import { getInitialTableState, sort, TableState } from '@tezblock/domain/table'
import { TezosPayoutInfo } from '@airgap/coinlib-core'

const ensure30Days = (balance: Balance[]): Balance[] => {
  const toDay = (index: number): number =>
    moment
      .utc()
      .add(-29 + index, 'days')
      .valueOf()
  const getBalanceFrom = (date: number) => (balanceItem: Balance) =>
    moment(balanceItem.asof).startOf('day').isSame(moment(date).startOf('day'))
  const getPreviousBalance = (balance: Balance[], date: number) => {
    const match = balance.find((balanceItem: Balance) => moment(balanceItem.asof).startOf('day').isBefore(moment(date).startOf('day')))

    return match ? { ...match, asof: date } : undefined
  }
  const attachBalance = (date: number): Balance =>
    balance.find(getBalanceFrom(date)) || getPreviousBalance(balance, date) || { balance: 0, asof: date }

  return range(0, 30).map(pipe(toDay, attachBalance))
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
  get((feeByCycle) => feeByCycle.value * 100)
)

export const fromBakingBadResponse = (response: BakingBadResponse, state: State): BakingRatingResponse => ({
  bakingRating:
    response.status === 'success' && response.payoutAccuracy
      ? response.payoutAccuracy !== 'no_data'
        ? response.payoutAccuracy
        : null
      : null,
  tezosBakerFee: response.status === 'success' ? extractFee(response.config.fee) : null,
  stakingCapacity: get<number>((stakingCapacity) => stakingCapacity * xtzToMutezConvertionRatio)(response.stakingCapacity)
})

export interface Busy {
  rewardAmount: boolean
  bakerReward: boolean
}

export interface BakerTableRatings {
  bakingBadRating: string
  tezosBakerRating: string
  stakingCapacity?: number
}

export interface State {
  address: string
  account: Account
  delegatedAccounts: Account[]
  relatedAccounts: Account[]
  transactions: TableState<Transaction>
  counts: Count[]
  kind: string
  rewardAmount: string
  busy: Busy
  balanceFromLast30Days: Balance[]
  bakerTableRatings: BakerTableRatings
  tezosBakerFee: number
  temporaryBalance: Balance[]
  bakerReward: TezosPayoutInfo
  contractAssets: TableState<ContractAsset>
}

export const initialState: State = {
  address: undefined,
  account: undefined,
  delegatedAccounts: undefined,
  relatedAccounts: undefined,
  transactions: getInitialTableState(sort('block_level', 'desc')),
  counts: undefined,
  kind: undefined,
  rewardAmount: undefined,
  busy: {
    rewardAmount: false,
    bakerReward: false
  },
  balanceFromLast30Days: undefined,
  bakerTableRatings: undefined,
  tezosBakerFee: undefined,
  temporaryBalance: undefined,
  bakerReward: undefined,
  contractAssets: getInitialTableState(undefined, Number.MAX_SAFE_INTEGER)
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
  on(actions.loadAccountFailed, (state) => ({
    ...state,
    account: null
  })),
  on(actions.loadDelegatedAccountsSucceeded, (state, { accounts }) => ({
    ...state,
    delegatedAccounts: accounts.delegated,
    relatedAccounts: accounts.related
  })),
  on(actions.loadDelegatedAccountsFailed, (state) => ({
    ...state,
    delegatedAccounts: null
  })),
  on(actions.loadRewardAmont, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      rewardAmount: true
    }
  })),
  on(actions.loadRewardAmontSucceeded, (state, { rewardAmount }) => ({
    ...state,
    rewardAmount: rewardAmount,
    busy: {
      ...state.busy,
      rewardAmount: false
    }
  })),
  on(actions.loadRewardAmontFailed, (state) => ({
    ...state,
    rewardAmount: null,
    busy: {
      ...state.busy,
      rewardAmount: false
    }
  })),
  on(actions.loadTransactionsByKind, (state, { kind }) => {
    const hasKindChanged = kind !== state.kind

    return {
      ...state,
      kind,
      transactions: {
        ...state.transactions,
        data: hasKindChanged ? undefined : state.transactions.data,
        loading: true
      }
    }
  }),
  on(actions.loadTransactionsByKindSucceeded, (state, { data }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      data,
      loading: false
    }
  })),
  on(actions.loadTransactionsByKindFailed, (state) => ({
    ...state,
    transactions: {
      ...state.transactions,
      loading: false
    }
  })),
  on(actions.increasePageSize, (state) => ({
    ...state,
    transactions: {
      ...state.transactions,
      pagination: {
        ...state.transactions.pagination,
        currentPage: state.transactions.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      orderBy
    }
  })),
  on(actions.loadBalanceForLast30DaysSucceeded, (state, { balanceFromLast30Days }) => ({
    ...state,
    balanceFromLast30Days: ensure30Days(balanceFromLast30Days)
  })),
  on(actions.loadExtraBalance, (state, { temporaryBalance }) => ({
    ...state,
    temporaryBalance: temporaryBalance
  })),
  on(actions.loadExtraBalanceSucceeded, (state, { extraBalance }) => ({
    ...state,
    balanceFromLast30Days: ensure30Days(extraBalance),
    temporaryBalance: undefined
  })),
  on(actions.loadBakingBadRatingsSucceeded, (state, { response }) => ({
    ...state,
    bakerTableRatings: {
      ...state.bakerTableRatings,
      bakingBadRating: response.bakingRating,
      stakingCapacity: response.stakingCapacity
    },
    tezosBakerFee: response.tezosBakerFee,
    busy: {
      ...state.busy,
      bakerTableRatings: false
    }
  })),

  on(actions.loadTransactionsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts: (counts || []).concat([{ key: 'assets', count: state.contractAssets.pagination.total }])
  })),
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById }) => ({
    ...state,
    transactions: getTransactionsWithErrors(operationErrorsById, state.transactions)
  })),
  on(actions.loadBakerReward, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      bakerReward: true
    }
  })),
  on(actions.loadBakerRewardSucceeded, (state, { bakerReward }) => ({
    ...state,
    bakerReward,
    busy: {
      ...state.busy,
      bakerReward: false
    }
  })),
  on(actions.loadBakerRewardFailed, (state) => ({
    ...state,
    bakerReward: null,
    busy: {
      ...state.busy,
      bakerReward: false
    }
  })),
  on(actions.loadContractAssets, (state) => ({
    ...state,
    contractAssets: {
      ...state.contractAssets,
      loading: true
    }
  })),
  on(actions.loadContractAssetsSucceeded, (state, { data }) => ({
    ...state,
    counts: (state.counts || []).filter((count) => count.key !== 'assets').concat([{ key: 'assets', count: data.length }]),
    contractAssets: {
      ...state.contractAssets,
      data,
      pagination: {
        ...state.contractAssets.pagination,
        total: data.length
      },
      loading: false
    }
  })),
  on(actions.loadContractAssetsFailed, (state) => ({
    ...state,
    contractAssets: {
      ...state.contractAssets,
      data: null,
      loading: false
    }
  })),
  on(actions.setKind, (state, { kind }) => ({
    ...state,
    kind
  })),
  on(actions.loadStakingCapacityFromTezosProtocolSucceeded, (state, { stakingCapacity }) => ({
    ...state,
    bakerTableRatings: {
      ...state.bakerTableRatings,
      stakingCapacity
    }
  })),
  on(actions.reset, () => initialState)
)
