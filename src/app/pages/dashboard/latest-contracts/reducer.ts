import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { TokenContract } from '@tezblock/domain/contract'

interface Busy {
    contracts: boolean
}

export interface State {
  contracts: TokenContract[],
  busy: Busy
}

const initialState: State = {
  contracts: undefined,
  busy: {
      contracts: false
  }
}

export const reducer = createReducer(
  initialState,

  on(actions.loadContracts, state => ({
    ...state,
    busy: {
        ...state.busy,
        contracts: true
    }
  })),
  on(actions.loadContractsSucceeded, (state, { contracts }) => ({
    ...state,
    contracts,
    busy: {
        ...state.busy,
        contracts: false
    }
  })),
  on(actions.loadContractsFailed, state => ({
    ...state,
    busy: {
        ...state.busy,
        contracts: false
    }
  })),
  on(actions.reset, () => initialState)
)
