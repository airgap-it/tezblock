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
  operations: TableState<Transaction>
  transactions: TableState<Transaction>
  counts: Count[]
  transactionsLoadedByBlockHash: string
  kind: string
  busy: Busy
}

export const initialState: State = {
  id: undefined,
  block: undefined,
  operations: getInitialTableState(),
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
  on(actions.loadOperationsByKind, (state, { blockHash, kind }) => ({
    ...state,
    blockHash,
    kind,
    transactionsLoadedByBlockHash: blockHash,
    operations: {
      ...state.operations,
      loading: true
    }
  })),
  on(actions.loadOperationsByKindSucceeded, (state, { data }) => ({
    ...state,
    operations: {
      ...state.operations,
      data,
      loading: false
    },
    transactions:
      state.kind === OperationTypes.Transaction
        ? {
            ...state.transactions,
            data,
            loading: false
          }
        : state.transactions
  })),
  on(actions.loadOperationsByKindFailed, state => ({
    ...state,
    operations: {
      ...state.operations,
      loading: false
    },
    transactions:
      state.kind === OperationTypes.Transaction
        ? {
            ...state.transactions,
            loading: false
          }
        : state.transactions
  })),
  on(actions.loadTransactions, (state, { blockHash }) => ({
    ...state,
    blockHash,
    kind: OperationTypes.Transaction,
    transactionsLoadedByBlockHash: blockHash,

    // this data(transactions) serves block-details table and assets-value
    operations: {
      ...state.operations,
      loading: true
    },
    transactions: {
      ...state.transactions,
      loading: true
    }
  })),
  on(actions.loadTransactionsSucceeded, (state, { data }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      data,
      loading: false
    }
  })),
  on(actions.loadTransactionsFailed, state => ({
    ...state,
    transactions: {
      ...state.transactions,
      loading: false
    }
  })),
  on(actions.increasePageSize, state => ({
    ...state,
    operations: {
      ...state.operations,
      pagination: {
        ...state.operations.pagination,
        currentPage: state.operations.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadOperationsCountsSucceeded, (state, { counts }) => ({
    ...state,
    counts
  })),
  on(actions.sortOperationsByKind, (state, { orderBy }) => ({
    ...state,
    orderBy
  })),
  on(actions.reset, () => initialState),
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById }) => ({
    ...state,
    operations: getTransactionsWithErrors(operationErrorsById, state.operations)
  }))
)
