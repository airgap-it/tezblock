import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'

export interface Busy {
  data: boolean
  rewardAmont: boolean
}

export interface State {
  address: string
  data: Transaction[]
  kind: string
  pageSize: number
  rewardAmont: string
  busy: Busy
}

const initialState: State = {
  address: undefined,
  data: undefined,
  kind: undefined,
  pageSize: 10,
  rewardAmont: undefined,
  busy: {
    data: false,
    rewardAmont: false
  }
}

export const reducer = createReducer(
  initialState,
  on(actions.loadAccount, (state, { address }) => ({
    ...state,
    address
  })),
  // TODO: hande other account actions
  on(actions.loadRewardAmont, state => ({
    ...state,
    busy: {
      ...state.busy,
      rewardAmont: true
    }
  })),
  on(actions.loadRewardAmontSucceeded, (state, { rewardAmont }) => ({
    ...state,
    rewardAmont,
    busy: {
      ...state.busy,
      rewardAmont: false
    }
  })),
  on(actions.loadRewardAmontFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      rewardAmont: false
    }
  })),
  on(actions.loadDataByKind, (state, { kind, address }) => ({
    ...state,
    kind: kind,
    busy: {
      ...state.busy,
      data: true
    }
  })),
  on(actions.loadDataByKindSucceeded, (state, { data }) => ({
    ...state,
    data,
    busy: {
      ...state.busy,
      data: false
    }
  })),
  on(actions.loadDataByKindFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      data: false
    }
  })),
  on(actions.increasePageSize, state => ({
    ...state,
    pageSize: state.pageSize + 10
  })),
  on(actions.reset, () => initialState)
)
