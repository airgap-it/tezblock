import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Contract } from '@tezblock/domain/contract'

export interface State {
  address: string
  contract: Contract
  copyToClipboardState: string
}

const initialState: State = {
  address: undefined,
  contract: undefined,
  copyToClipboardState: 'copyGrey'
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
  on(actions.reset, () => initialState)
)
