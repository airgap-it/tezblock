import { createReducer, on } from '@ngrx/store'
import { TezosTransactionCursor, IAirGapTransaction } from 'airgap-coin-lib'

import * as actions from './actions'
import { TokenContract, ContractOperation } from '@tezblock/domain/contract'
import { TableState, getInitialTableState } from '@tezblock/domain/table'
import { first } from '@tezblock/services/fp'

const airGapTransactionToContractOperation = (airGapTransaction: IAirGapTransaction): ContractOperation => ({
  ...airGapTransaction,
  singleFrom: first(airGapTransaction.from),
  singleTo: first(airGapTransaction.to)
})

export interface State {
  address: string
  contract: TokenContract
  copyToClipboardState: string
  transferOperations: TableState<ContractOperation>
  otherOperations: TableState<ContractOperation>
  currentTabKind: actions.OperationTab
  cursor: TezosTransactionCursor
}

const initialState: State = {
  address: undefined,
  contract: undefined,
  copyToClipboardState: 'copyGrey',
  transferOperations: getInitialTableState({
    field: 'block_level',
    direction: 'desc'
  }),
  otherOperations: getInitialTableState({
    field: 'block_level',
    direction: 'desc'
  }),
  currentTabKind: actions.OperationTab.transfers,
  cursor: undefined
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
  on(actions.sortTransferOperations, (state, { orderBy }) => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      orderBy
    }
  })),
  on(actions.loadOtherOperations, state => ({
    ...state,
    otherOperations: {
      ...state.otherOperations,
      loading: true
    }
  })),
  on(actions.loadOtherOperationsSucceeded, (state, { otherOperations }) => {
    return {
      ...state,
      otherOperations: {
        ...state.otherOperations,
        data: otherOperations,
        loading: false
      }
    }
  }),
  on(actions.loadOtherOperationsFailed, state => ({
    ...state,
    otherOperations: {
      ...state.otherOperations,
      loading: false
    }
  })),
  on(actions.loadMoreOtherOperations, state => ({
    ...state,
    otherOperations: {
      ...state.otherOperations,
      pagination: {
        ...state.otherOperations.pagination,
        currentPage: state.otherOperations.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortOtherOperations, (state, { orderBy }) => ({
    ...state,
    otherOperations: {
      ...state.otherOperations,
      orderBy
    }
  })),
  on(actions.loadOperationsCountSucceeded, (state, { transferTotal, otherTotal }) => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      pagination: {
        ...state.transferOperations.pagination,
        total: transferTotal
      }
    },
    otherOperations: {
      ...state.otherOperations,
      pagination: {
        ...state.otherOperations.pagination,
        total: otherTotal
      }
    }
  })),
  on(actions.changeOperationsTab, (state, { currentTabKind }) => ({
    ...state,
    currentTabKind
  })),
  on(actions.reset, () => initialState)
)
