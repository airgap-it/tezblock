import { createReducer, on } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'
import BigNumber from 'bignumber.js'
import * as moment from 'moment'

import * as actions from './app.actions'
import { Block } from '@tezblock/interfaces/Block'
import { CurrencyInfo } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { ExchangeRates } from '@tezblock/services/cache/cache.service'
import { ProtocolConstantResponse } from '@tezblock/services/protocol-variables/protocol-variables.service'

const updateExchangeRates = (from: string, to: string, price: number, exchangeRates: ExchangeRates): ExchangeRates => {
  return {
    ...exchangeRates,
    [from]: {
      ...exchangeRates[from],
      [to]: price
    }
  }
}

export interface State {
  firstBlockOfCurrentCycle: Block
  latestBlock: Block
  navigationHistory: NavigationEnd[]
  currentVotingPeriod: number
  currentVotingeriodPosition: number
  blocksPerVotingPeriod: number
  exchangeRates: ExchangeRates
  protocolVariables: ProtocolConstantResponse
  busy: {
    protocolVariables: boolean
  }

  // TODO: refactor there 2 properties ( I suppose these are prices XTZ -> BTC & USD ), and now BTC -> USD is added
  // move into exchangeRate
  // XTZ -> BTC
  cryptoCurrencyInfo: CurrencyInfo

  // XTZ -> USD
  fiatCurrencyInfo: CurrencyInfo
}

export const initialState: State = {
  firstBlockOfCurrentCycle: undefined,
  latestBlock: undefined,
  navigationHistory: [],
  currentVotingPeriod: undefined,
  currentVotingeriodPosition: undefined,
  blocksPerVotingPeriod: undefined,
  exchangeRates: {},
  protocolVariables: undefined,
  busy: {
    protocolVariables: false
  },
  cryptoCurrencyInfo: {
    symbol: 'BTC',
    currency: 'BTC',
    price: new BigNumber(0)
  },
  fiatCurrencyInfo: {
    symbol: '$',
    currency: 'USD',
    price: new BigNumber(0)
  }
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
  on(actions.loadPeriodInfosFailed, (state) => ({
    ...state,
    currentVotingPeriod: null,
    currentVotingeriodPosition: null,
    blocksPerVotingPeriod: null
  })),
  on(actions.loadCryptoPriceSucceeded, (state, { fiatPrice, cryptoPrice }) => ({
    ...state,
    fiatCurrencyInfo: {
      ...state.fiatCurrencyInfo,
      price: fiatPrice
    },
    cryptoCurrencyInfo: {
      ...state.cryptoCurrencyInfo,
      price: cryptoPrice
    }
  })),
  on(actions.loadExchangeRateSucceeded, (state, { from, to, price }) => ({
    ...state,
    exchangeRates: updateExchangeRates(from, to, price, state.exchangeRates)
  })),
  on(actions.loadProtocolVariables, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      protocolVariables: true
    }
  })),
  on(actions.loadProtocolVariablesSucceeded, (state, { protocolVariables }) => ({
    ...state,
    protocolVariables,
    busy: {
      ...state.busy,
      protocolVariables: false
    }
  })),
  on(actions.loadProtocolVariablesFailed, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      protocolVariables: false
    }
  }))
)

const getRemainingTime = (currentBlockLevel: number, cycleEndingBlockLevel: number, timeBetweenBlocks: number): string => {
  const remainingBlocks = cycleEndingBlockLevel - currentBlockLevel
  const totalSeconds = remainingBlocks * timeBetweenBlocks
  const duration = moment.duration(totalSeconds * 1000)

  return duration.days() >= 1
    ? `~${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`
    : `~${duration.hours()}h ${duration.minutes()}m`
}
const getRoundedRemainingTime = (currentBlockLevel: number, cycleEndingBlockLevel: number, timeBetweenBlocks: number): string => {
  const remainingBlocks = cycleEndingBlockLevel - currentBlockLevel
  const totalSeconds = remainingBlocks * timeBetweenBlocks
  const duration = moment.duration(totalSeconds * 1000)
  const days = duration.hours() > 0 || duration.minutes() > 0 ? duration.days() + 1 : duration.days()

  return `~${days}d`
}

export const currentCycleSelector = (state: State): number => (state.latestBlock ? state.latestBlock.meta_cycle : undefined)
export const currentBlockLevelSelector = (state: State): number => (state.latestBlock ? state.latestBlock.level : undefined)
export const cycleStartingBlockLevelSelector = (state: State): number =>
  state.firstBlockOfCurrentCycle ? state.firstBlockOfCurrentCycle.level : undefined
export const cycleEndingBlockLevelSelector = (state: State): number =>
  state.firstBlockOfCurrentCycle ? state.firstBlockOfCurrentCycle.level + (state.protocolVariables.blocks_per_cycle - 1) : undefined
export const cycleProgressSelector = (state: State): number =>
  state.firstBlockOfCurrentCycle && state.latestBlock.level
    ? Math.round(((state.latestBlock.level - state.firstBlockOfCurrentCycle.level) / state.protocolVariables.blocks_per_cycle) * 100)
    : undefined
export const remainingTimeSelector = (state: State): string =>
  state.firstBlockOfCurrentCycle && state.latestBlock.level
    ? getRemainingTime(currentBlockLevelSelector(state), cycleEndingBlockLevelSelector(state), Number(state.protocolVariables.minimal_block_delay))
    : undefined
export const roundedRemainingTimeSelector = (state: State): string =>
  state.firstBlockOfCurrentCycle && state.latestBlock.level
    ? getRoundedRemainingTime(currentBlockLevelSelector(state), cycleEndingBlockLevelSelector(state), Number(state.protocolVariables.minimal_block_delay))
    : undefined
