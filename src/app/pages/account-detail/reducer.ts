import { createReducer, on } from '@ngrx/store'
import { pipe } from 'rxjs'
import { range } from 'lodash'
import * as moment from 'moment'
import { TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'
import { Balance } from '@tezblock/services/api/api.service'
import { first, get } from '@tezblock/services/fp'
import { FeeByCycle, BakingBadResponse } from '@tezblock/interfaces/BakingBadResponse'
import { MyTezosBakerResponse } from '@tezblock/interfaces/MyTezosBakerResponse'
import { Count } from '@tezblock/domain/tab'
import { getTransactionsWithErrors } from '@tezblock/domain/operations'
import { BakingRatingResponse, ContractAsset } from './model'
import { xtzToMutezConvertionRatio } from '@tezblock/domain/airgap'

import { getInitialTableState, sort, TableState } from '@tezblock/domain/table'

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
  get(feeByCycle => feeByCycle.value * 100)
)

export const fromBakingBadResponse = (response: BakingBadResponse, state: State): BakingRatingResponse => ({
  bakingRating:
    response.status === 'success' && response.payoutAccuracy
      ? response.payoutAccuracy !== 'no_data'
        ? response.payoutAccuracy
        : null
      : null,
  tezosBakerFee: response.status === 'success' ? extractFee(response.config.fee) : null,
  stakingCapacity: get<number>(stakingCapacity => stakingCapacity * xtzToMutezConvertionRatio)(response.stakingCapacity)
})

export const fromMyTezosBakerResponse = (response: MyTezosBakerResponse, state: State, updateFee: boolean): BakingRatingResponse => ({
  bakingRating:
    response.status === 'success' && response.rating
      ? (Math.round((Number(response.rating) + 0.00001) * 100) / 100).toString() + ' %'
      : null,
  tezosBakerFee: updateFee ? (response.status === 'success' && response.fee ? parseFloat(response.fee) : null) : state.tezosBakerFee
})

export interface Busy {
  rewardAmont: boolean
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
  rewardAmont: string
  busy: Busy
  balanceFromLast30Days: Balance[]
  bakerTableRatings: BakerTableRatings
  tezosBakerFee: number
  temporaryBalance: Balance[]
  bakerReward: TezosPayoutInfo
  contractAssets: TableState<ContractAsset>
}

const initialState: State = {
  address: undefined,
  account: undefined,
  delegatedAccounts: undefined,
  relatedAccounts: undefined,
  transactions: getInitialTableState(sort('block_level', 'desc')),
  counts: undefined,
  kind: undefined,
  rewardAmont: undefined,
  busy: {
    rewardAmont: false,
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
  on(actions.loadAccountFailed, state => ({
    ...state,
    account: null
  })),
  on(actions.loadDelegatedAccountsSucceeded, (state, { accounts }) => ({
    ...state,
    delegatedAccounts: accounts.delegated,
    relatedAccounts: accounts.related
  })),
  on(actions.loadDelegatedAccountsFailed, state => ({
    ...state,
    delegatedAccounts: null
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
    transactions: {
      ...state.transactions,
      loading: true
    }
  })),
  on(actions.loadTransactionsByKindSucceeded, (state, { data }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      data,
      loading: false
    }
  })),
  on(actions.loadTransactionsByKindFailed, state => ({
    ...state,
    transactions: {
      ...state.transactions,
      loading: false
    }
  })),
  on(actions.increasePageSize, state => ({
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
  on(actions.loadTransactionsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts: (counts || []).concat([{ key: 'assets', count: state.contractAssets.pagination.total }])
  })),
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById }) => ({
    ...state,
    transactions: getTransactionsWithErrors(operationErrorsById, state.transactions)
  })),
  on(actions.loadBakerReward, state => ({
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
  on(actions.loadBakerRewardFailed, state => ({
    ...state,
    bakerReward: null,
    busy: {
      ...state.busy,
      bakerReward: false
    }
  })),
  on(actions.loadContractAssets, state => ({
    ...state,
    contractAssets: {
      ...state.contractAssets,
      loading: true
    }
  })),
  on(actions.loadContractAssetsSucceeded, (state, { data }) => ({
    ...state,
    counts: (state.counts || []).filter(count => count.key !== 'assets').concat([{ key: 'assets', count: data.length }]),
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
  on(actions.loadContractAssetsFailed, state => ({
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
