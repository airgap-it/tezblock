import { createReducer, on } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'

import * as actions from './app.actions'
import { Block } from '@tezblock/interfaces/Block'

export interface State {
    firstBlockOfCurrentCycle: Block,
    latestBlock: Block,
    navigationHistory: NavigationEnd[]
}

const initialState: State = {
    firstBlockOfCurrentCycle: undefined,
    latestBlock: undefined,
    navigationHistory: []
}

export const reducer = createReducer(
  initialState,
  on(actions.loadFirstBlockOfCycleSucceeded, (state, { firstBlockOfCycle }) => ({
    ...state,
    firstBlockOfCurrentCycle: firstBlockOfCycle
  })),
  on(actions.loadLatestBlockSucceeded, (state, { latestBlock }) => ({
    ...state,
    latestBlock
  })),
  on(actions.saveLatestRoute, (state, { navigation }) => ({
    ...state,
    navigationHistory: state.navigationHistory.concat(navigation)
  }))
)

export const currentCycleSelector = (state: State): number => state.latestBlock ? state.latestBlock.meta_cycle : undefined
export const currentBlockLevelSelector = (state: State): number => state.latestBlock ? state.latestBlock.level : undefined