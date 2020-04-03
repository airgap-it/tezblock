import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { TokenContract } from '@tezblock/domain/contract'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { PeriodTimespan, fillMissingPeriodTimespans } from '@tezblock/domain/vote'
import { first } from '@tezblock/services/fp'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'

interface Busy {
  blocks: boolean
  contracts: boolean
  proposal: boolean
  currentPeriodTimespan: boolean
  transactions: boolean
}

export interface State {
  blocks: Block[]
  contracts: TokenContract[]
  proposal: ProposalListDto
  transactions: Transaction[]
  currentPeriodTimespan: PeriodTimespan
  busy: Busy
}

const initialState: State = {
  blocks: undefined,
  contracts: undefined,
  proposal: undefined,
  currentPeriodTimespan: undefined,
  transactions: undefined,
  busy: {
    blocks: false,
    contracts: false,
    proposal: false,
    currentPeriodTimespan: false,
    transactions: false
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
  on(actions.loadLatestProposal, state => ({
    ...state,
    busy: {
      ...state.busy,
      proposal: true
    }
  })),
  on(actions.loadLatestProposalSucceeded, (state, { proposal }) => ({
    ...state,
    proposal,
    busy: {
      ...state.busy,
      proposal: false
    }
  })),
  on(actions.loadLatestProposalFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      proposal: false
    }
  })),
  on(actions.loadCurrentPeriodTimespan, state => ({
    ...state,
    busy: {
      ...state.busy,
      currentPeriodTimespan: true
    }
  })),
  on(actions.loadCurrentPeriodTimespanSucceeded, (state, { currentPeriodTimespan, blocksPerVotingPeriod }) => ({
    ...state,
    currentPeriodTimespan: first(fillMissingPeriodTimespans([currentPeriodTimespan], blocksPerVotingPeriod)),
    busy: {
      ...state.busy,
      currentPeriodTimespan: false
    }
  })),
  on(actions.loadCurrentPeriodTimespanFailed, state => ({
    ...state,
    busy: {
      ...state.busy,
      currentPeriodTimespan: false
    }
  })),
  on(actions.loadTransactions, state => ({
    ...state,
    busy: {
      ...state.busy,
      transactions: true
    }
  })),
  on(actions.loadTransactionsSucceeded, (state, { transactions }) => ({
    ...state,
    transactions,
    busy: {
      ...state.busy,
      transactions: false
    }
  })),
  on(actions.loadTransactionsFailed, state => ({
    ...state,
    transactions: null,
    busy: {
      ...state.busy,
      transactions: false
    }
  })),
  on(actions.loadBlocks, state => ({
    ...state,
    busy: {
      ...state.busy,
      blocks: true
    }
  })),
  on(actions.loadBlocksSucceeded, (state, { blocks }) => ({
    ...state,
    blocks,
    busy: {
      ...state.busy,
      blocks: false
    }
  })),
  on(actions.loadBlocksFailed, state => ({
    ...state,
    blocks: null,
    busy: {
      ...state.busy,
      blocks: false
    }
  })),
  on(actions.reset, () => initialState)
)
