import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { TokenContract } from '@tezblock/domain/contract'

export interface State {
  tokenContracts: TableState<TokenContract>
}

const initialState: State = {
  tokenContracts: getInitialTableState()
}

export const reducer = createReducer(
  initialState,
  on(actions.loadTokenContracts, state => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      loading: true
    }
  })),
  on(actions.loadTokenContractsSucceeded, (state, { tokenContracts }) => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      data: tokenContracts.data,
      pagination: {
        ...state.tokenContracts.pagination,
        total: tokenContracts.total
      },
      loading: false
    }
  })),
  on(actions.loadTokenContractsFailed, state => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      data: null,
      loading: false
    }
  })),
  on(actions.increasePageOfTokenContracts, state => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      pagination: {
        ...state.tokenContracts.pagination,
        currentPage: state.tokenContracts.pagination.currentPage + 1
      }
    }
  })),
  on(actions.reset, () => initialState)
)
