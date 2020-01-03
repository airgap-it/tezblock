import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { BlockStatus } from '@tezblock/services/health/health.service'

export interface State {
    latestNodeBlock: any
    latestConseilBlock: BlockStatus
}

const initialState: State = {
    latestNodeBlock: undefined,
    latestConseilBlock: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.loadLatestNodeBlockSucceeded, (state, { latestNodeBlock }) => ({
    ...state,
    latestNodeBlock
  })),
  on(actions.loadLatestConseilBlockSucceeded, (state, { latestConseilBlock }) => ({
    ...state,
    latestConseilBlock
  })),
  on(actions.reset, () => initialState)
)
