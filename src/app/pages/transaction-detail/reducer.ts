import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'

export interface Busy {
  transactions: boolean
}

export interface State {
  transactionHash: string
  transactions: Transaction[]
  latestBlock: Block
  pageSize: number // transactions
  busy: Busy
}

const initialState: State = {
  transactionHash: undefined,
  transactions: undefined,
  latestBlock: undefined,
  pageSize: 10,
  busy: {
    transactions: false
  }
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
  on(actions.reset, () => initialState)
)
