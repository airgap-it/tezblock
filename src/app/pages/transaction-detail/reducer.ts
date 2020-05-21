import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Count } from '@tezblock/domain/tab'
import { sort, TableState, getInitialTableState } from '@tezblock/domain/table'
import { getTransactionsWithErrors } from '@tezblock/domain/operations'
import { isNotEmptyArray } from '@tezblock/services/fp'

export interface Busy {
  transactions: boolean
}

export interface State {
  transactionHash: string
  transactions: TableState<Transaction>
  counts: Count[]
  kind: string
  latestBlock: Block
  totalAmount: number
  totalFee: number

}

export interface Sorting {
  direction: string
  value: string
}

const initialState: State = {
  transactionHash: undefined,
  transactions: getInitialTableState(sort('block_level', 'desc')),
  counts: undefined,
  kind: 'transaction',
  latestBlock: undefined,
  totalAmount: undefined,
  totalFee: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.loadTransactionsByHash, (state, { transactionHash }) => ({
    ...state,
    transactionHash,
    transactions: {
      ...state.transactions,
      loading: true
    }
  })),
  on(actions.loadTransactionsByHashSucceeded, (state, { data }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      data: isNotEmptyArray(data) ? data : null,
      loading: false
    }
  })),
  on(actions.loadTransactionsByHashFailed, state => ({
    ...state,
    transactions: {
      ...state.transactions,
      data: null,
      loading: false
    }
  })),
  on(actions.loadLatestBlockSucceeded, (state, { latestBlock }) => ({
    ...state,
    latestBlock
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
  on(actions.loadTransactionsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts
  })),
  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      orderBy
    }
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
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById }) => ({
    ...state,
    transactions: getTransactionsWithErrors(operationErrorsById, state.transactions)
  })),
  on(actions.changeKind, (state, { kind }) => ({
    ...state,
    kind
  })),
  on(actions.reset, () => initialState)
)
