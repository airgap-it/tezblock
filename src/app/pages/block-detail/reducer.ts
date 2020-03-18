import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Count } from '@tezblock/domain/tab'
import { getTransactionsWithErrors, OperationTypes } from '@tezblock/domain/operations'
import { getInitialTableState, TableState } from '@tezblock/domain/table'

export interface Busy {
  block: boolean
}

export interface State {
  id: string
  block: Block
  transactions: TableState<Transaction>
  counts: Count[]
  transactionsLoadedByBlockHash: string
  kind: string
  busy: Busy
}

const initialState: State = {
  id: undefined,
  block: undefined,
  transactions: getInitialTableState(),
  counts: undefined,
  transactionsLoadedByBlockHash: undefined,
  kind: OperationTypes.Transaction,
  busy: {
    block: false
  }
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
  })),
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById }) => ({
    ...state,
    transactions: getTransactionsWithErrors(operationErrorsById, state.transactions)
  }))
)
