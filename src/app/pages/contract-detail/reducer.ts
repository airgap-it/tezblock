import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { TokenContract, ContractOperation, TokenHolder } from '@tezblock/domain/contract'
import { TableState, getInitialTableState } from '@tezblock/domain/table'
import { get } from '@tezblock/services/fp'
import { getTransactionsWithErrors } from '@tezblock/domain/operations'

export interface State {
  manager: string
  address: string
  contract: TokenContract
  copyToClipboardState: string
  transferOperations: TableState<ContractOperation>
  otherOperations: TableState<ContractOperation>
  tokenHolders: TableState<TokenHolder>
  entrypoints: TableState<string>
  currentTabKind: actions.OperationTab
}

export const initialState: State = {
  manager: undefined,
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
  tokenHolders: getInitialTableState(),
  currentTabKind: actions.OperationTab.transfers,
  entrypoints: getInitialTableState()
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
  on(actions.loadTransferOperationsSucceeded, (state, { data }) => ({
    ...state,
    transferOperations: {
      ...state.transferOperations,
      data,
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
  // on(actions.sortTransferOperations, (state, { orderBy }) => ({
  //   ...state,
  //   transferOperations: {
  //     ...state.transferOperations,
  //     orderBy
  //   }
  // })),
  on(actions.loadOtherOperations, state => ({
    ...state,
    otherOperations: {
      ...state.otherOperations,
      loading: true
    }
  })),
  on(actions.loadOtherOperationsSucceeded, (state, { data }) => ({
    ...state,
    otherOperations: {
      ...state.otherOperations,
      data,
      loading: false
    }
  })),
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
  on(actions.loadManagerAddressSucceeded, (state, { manager }) => ({
    ...state,
    manager
  })),
  on(actions.loadManagerAddressFailed, (state, { error }) => ({
    ...state,
    manager: null
  })),
  on(actions.loadTokenHolders, state => ({
    ...state,
    tokenHolders: {
      ...state.tokenHolders,
      loading: true
    }
  })),
  on(actions.loadTokenHoldersSucceeded, (state, { data }) => ({
    ...state,
    tokenHolders: {
      ...state.tokenHolders,
      data,
      pagination: {
        ...state.tokenHolders.pagination,
        total: data.length
      },
      loading: false
    }
  })),
  on(actions.loadTokenHoldersFailed, state => ({
    ...state,
    tokenHolders: {
      ...state.tokenHolders,
      loading: false
    }
  })),
  on(actions.loadMoreTokenHolders, state => ({
    ...state,
    tokenHolders: {
      ...state.tokenHolders,
      pagination: {
        ...state.tokenHolders.pagination,
        currentPage: state.tokenHolders.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadEntrypoints, state => ({
    ...state,
    entrypoints: {
      ...state.entrypoints,
      loading: true
    }
  })),
  on(actions.loadEntrypointsSucceeded, (state, { data }) => ({
    ...state,
    entrypoints: {
      ...state.entrypoints,
      data,
      pagination: {
        ...state.entrypoints.pagination,
        total: data.length
      },
      loading: false
    }
  })),
  on(actions.loadEntrypointsFailed, state => ({
    ...state,
    entrypoints: {
      ...state.entrypoints,
      loading: false
    }
  })),
  on(actions.loadMoreEntrypoints, state => ({
    ...state,
    entrypoints: {
      ...state.entrypoints,
      pagination: {
        ...state.entrypoints.pagination,
        currentPage: state.entrypoints.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById }) => ({
    ...state,
    transferOperations: <TableState<ContractOperation>>getTransactionsWithErrors(operationErrorsById, state.transferOperations)
  })),
  on(actions.reset, () => initialState)
)

export const transferOperationsSelector = (state: State): ContractOperation[] => {
  const pagination = state.transferOperations.pagination
  const to = pagination.currentPage * pagination.selectedSize

  return get<ContractOperation[]>(data => data.slice(0, to))(state.transferOperations.data)
}
