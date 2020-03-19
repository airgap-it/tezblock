import { createReducer, on } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'

import * as actions from './app.actions'
import { Block } from '@tezblock/interfaces/Block'

export const meanBlockTime = 60.032 // seconds, not as per https://medium.com/cryptium/tempus-fugit-understanding-cycles-snapshots-locking-and-unlocking-periods-in-the-tezos-protocol-78b27bd6d62d
export const numberOfBlocksToSeconds = (numberOfBlocks: number): number => meanBlockTime * numberOfBlocks

export const meanBlockTimeFromPeriod = 60.846710205078125 // Pascal's suspicious calculation from period length
export const numberOfBlocksToSecondsFromPeriod = (numberOfBlocks: number): number => meanBlockTimeFromPeriod * numberOfBlocks

export interface State {
  firstBlockOfCurrentCycle: Block
  latestBlock: Block
  navigationHistory: NavigationEnd[]
  currentVotingPeriod: number
  currentVotingeriodPosition: number
  blocksPerVotingPeriod: number
}

const initialState: State = {
  firstBlockOfCurrentCycle: undefined,
  latestBlock: undefined,
  navigationHistory: [],
  currentVotingPeriod: undefined,
  currentVotingeriodPosition: undefined,
  blocksPerVotingPeriod: undefined
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
  })),
  on(actions.loadPeriodInfosSucceeded, (state, { currentVotingPeriod, currentVotingeriodPosition, blocksPerVotingPeriod }) => ({
    ...state,
    currentVotingPeriod,
    currentVotingeriodPosition,
    blocksPerVotingPeriod
  })),
  on(actions.loadPeriodInfosFailed, state => ({
    ...state,
    currentVotingPeriod: null,
    currentVotingeriodPosition: null,
    blocksPerVotingPeriod: null
  }))
)

const getRemainingTime = (currentBlockLevel: number, cycleEndingBlockLevel: number): string => {
  const remainingBlocks = cycleEndingBlockLevel - currentBlockLevel
  let totalSeconds = numberOfBlocksToSeconds(remainingBlocks)
  let hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  const minutes = Math.floor(totalSeconds / 60)
  const days = Math.floor(hours / 24)
  hours %= 24

  return days >= 1 ? `~${days}d ${hours}h ${minutes}m` : `~${hours}h ${minutes}m`
}

export const currentCycleSelector = (state: State): number => (state.latestBlock ? state.latestBlock.meta_cycle : undefined)
export const currentBlockLevelSelector = (state: State): number => (state.latestBlock ? state.latestBlock.level : undefined)
export const cycleStartingBlockLevelSelector = (state: State): number =>
  state.firstBlockOfCurrentCycle ? state.firstBlockOfCurrentCycle.level : undefined
export const cycleEndingBlockLevelSelector = (state: State): number =>
  state.firstBlockOfCurrentCycle ? state.firstBlockOfCurrentCycle.level + 4095 : undefined
export const cycleProgressSelector = (state: State): number =>
  state.firstBlockOfCurrentCycle && state.latestBlock.level
    ? Math.round(((state.latestBlock.level - state.firstBlockOfCurrentCycle.level) / 4096) * 100)
    : undefined
export const remainingTimeSelector = (state: State): string =>
  state.firstBlockOfCurrentCycle && state.latestBlock.level
    ? getRemainingTime(currentBlockLevelSelector(state), cycleEndingBlockLevelSelector(state))
    : undefined
