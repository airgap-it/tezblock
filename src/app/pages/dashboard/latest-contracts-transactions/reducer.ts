import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'

interface Busy {
  transferOperations: boolean
}

export interface State {
  transferOperations: Transaction[]
  busy: Busy
}

const initialState: State = {
  transferOperations: undefined,
  busy: {
    transferOperations: false
  }
}

export const reducer = createReducer(
  initialState,

  on(actions.loadTransferOperations, state => ({
    ...state,
    busy: {
      ...state.busy,
      transferOperations: true
    }
  })),
  on(actions.loadTransferOperationsSucceeded, (state, { transferOperations }) => ({
    ...state,
    transferOperations,
    busy: {
      ...state.busy,
      transferOperations: false
    }
  })),
  on(actions.loadTransferOperationsFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      transferOperations: false
    }
  })),
  on(actions.reset, () => initialState)
)
