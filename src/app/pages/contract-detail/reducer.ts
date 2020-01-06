import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Contract } from '@tezblock/domain/contract'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { TableState, getInitialTableState } from '@tezblock/domain/table'

export interface State {
  address: string
  contract: Contract
  copyToClipboardState: string
  transferOperations: TableState<Transaction>
}

const initialState: State = {
  address: undefined,
  contract: undefined,
  copyToClipboardState: 'copyGrey',
  transferOperations: getInitialTableState()
}

export const reducer = createReducer(
  initialState,
  on(actions.loadContract, (state, { address }) => ({
    ...state,
    address
  })),
  on(actions.loadContractSucceeded, (state, { contract }) => ({
    ...state,
    contract: contract || null
  })),
  on(actions.loadContractFailed, state => ({
    ...state,
    contract: null
  })),
  on(actions.copyAddressToClipboard, state => ({
    ...state,
    copyToClipboardState: 'copyTick'
  })),
  on(actions.resetCopyToClipboardState, state => ({
    ...state,
    copyToClipboardState: 'copyGrey'
  })),
  on(actions.loadTransferOperations, state => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      loading: true
    }
  })),
  on(actions.loadTransferOperationsSucceeded, (state, { transferOperations }) => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      data: transferOperations,
      loading: false
    }
  })),
  on(actions.loadTransferOperationsFailed, state => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      loading: false
    }
  })),
  on(actions.loadMoreTransferOperations, state => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      pagination: {
        ...state.transferOperations.pagination,
        currentPage: state.transferOperations.pagination.currentPage + 1
      }
    }
  })),
  on(actions.reset, () => initialState)
)
