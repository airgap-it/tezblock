import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Count } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'
import { sort } from '@tezblock/domain/table'

export interface Busy {
  transactions: boolean
}

export interface State {
  transactionHash: string
  transactions: Transaction[]
  counts: Count[]
  latestBlock: Block
  pageSize: number // transactions
  busy: Busy
  orderBy: OrderBy
  totalAmount: number
  totalFee: number

}

export interface Sorting {
  direction: string
  value: string
}

const initialState: State = {
  transactionHash: undefined,
  transactions: undefined,
  counts: undefined,
  latestBlock: undefined,
  pageSize: 10,
  busy: {
    transactions: false
  },
  orderBy: sort('block_level', 'desc'),
  totalAmount: undefined,
  totalFee: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.loadTransactionsByHash, (state, { transactionHash }) => ({
    ...state,
    transactionHash,
    busy: {
      ...state.busy,
      transactions: true
    }
  })),
  on(actions.loadTransactionsByHashSucceeded, (state, { data }) => ({
    ...state,
    transactions: data,
    busy: {
      ...state.busy,
      transactions: false
    }
  })),
  on(actions.loadTransactionsByHashFailed, state => ({
    ...state,
    transactions: null,
    busy: {
      ...state.busy,
      transactions: false
    }
  })),
  on(actions.loadLatestBlockSucceeded, (state, { latestBlock }) => ({
    ...state,
    latestBlock
  })),
  on(actions.increasePageSize, state => ({
    ...state,
    pageSize: state.pageSize + 10
  })),
  on(actions.loadTransactionsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts
  })),
  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    orderBy
  })),
  on(actions.loadTransactionsTotalAmountSucceeded, (state, { totalAmount }) => ({
    ...state,
    totalAmount
  })),
  on(actions.loadTransactionsTotalAmountFailed, state => ({
    ...state,
    totalAmount: null
  })),
  on(actions.loadTransactionsTotalFeeSucceeded, (state, { totalFee }) => ({
    ...state,
    totalFee
  })),
  on(actions.loadTransactionsTotalFeeFailed, state => ({
    ...state,
    totalFee: null
  })),
  on(actions.reset, () => initialState)
)
