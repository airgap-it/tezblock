import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'

export interface Busy {
  block: boolean
  transactions: boolean
}

export interface State {
  id: string
  block: Block
  transactions: Transaction[]
  transactionsLoadedByBlockHash: string
  kind: string
  pageSize: number // transactions
  busy: Busy
  sortingDirection: string
  sortingValue: string
}

const initialState: State = {
  id: undefined,
  block: undefined,
  transactions: undefined,
  transactionsLoadedByBlockHash: undefined,
  kind: undefined,
  pageSize: 10,
  busy: {
    block: false,
    transactions: false
  },
  sortingDirection: undefined || 'asc' || 'desc',
  sortingValue: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.loadBlock, (state, { id }) => ({
    ...state,
    id,
    busy: {
      ...state.busy,
      block: true
    }
  })),
  on(actions.loadBlockSucceeded, (state, { block }) => ({
    ...state,
    block: block || null,
    busy: {
      ...state.busy,
      block: false
    }
  })),
  on(actions.loadBlockFailed, state => ({
    ...state,
    block: null,
    busy: {
      ...state.busy,
      block: false
    }
  })),
  on(actions.loadTransactionsByKind, (state, { blockHash, kind }) => ({
    ...state,
    blockHash,
    kind,
    transactionsLoadedByBlockHash: blockHash,
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
  on(actions.reset, () => initialState),
  on(actions.sortTransactionsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    sortingDirection: sortingDirection,
    sortingValue: sortingValue
  }))
)
