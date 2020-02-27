import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Count } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'

export interface Busy {
  block: boolean
  transactions: boolean
}

export interface State {
  id: string
  block: Block
  transactions: Transaction[]
  counts: Count[]
  transactionsLoadedByBlockHash: string
  kind: string
  pageSize: number // transactions
  busy: Busy
  orderBy: OrderBy
}

const initialState: State = {
  id: undefined,
  block: undefined,
  transactions: undefined,
  counts: undefined,
  transactionsLoadedByBlockHash: undefined,
  kind: undefined,
  pageSize: 10,
  busy: {
    block: false,
    transactions: false
  },
  orderBy: undefined
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
  on(actions.loadTransactionsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts
  })),
  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    orderBy
  })),
  on(actions.reset, () => initialState),
  on(actions.increaseBlock, state => ({
    ...state,
    id: (Number(state.id) + 1).toString()
  })),
  on(actions.decreaseBlock, state => ({
    ...state,
    id: (Number(state.id) - 1).toString()
  }))
)
