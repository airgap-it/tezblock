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
  cursor: TezosTransactionCursor
}

const initialState: State = {
  address: undefined,
  contract: undefined,
  copyToClipboardState: 'copyGrey',
  transferOperations: getInitialTableState(),
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
  on(actions.loadTransferOperationsSucceeded, (state, { transferOperations }) => {
    const newData = transferOperations.transactions.map(airGapTransactionToContractOperation)

    return {
      ...state,
      transferOperations: {
        ...state.transferOperations,
        data: state.cursor ? state.transferOperations.data.concat(newData) : newData,
        loading: false
      },
      cursor: transferOperations.cursor
    }
  }),
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
