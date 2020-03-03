import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { TokenContract } from '@tezblock/domain/contract'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { PeriodTimespan, fillMissingPeriodTimespans } from '@tezblock/domain/vote'
import { first } from '@tezblock/services/fp'

interface Busy {
    contracts: boolean
    proposal: boolean
    currentPeriodTimespan: boolean
}

export interface State {
  contracts: TokenContract[],
  proposal: ProposalListDto,
  currentPeriodTimespan: PeriodTimespan,
  busy: Busy
}

const initialState: State = {
  contracts: undefined,
  proposal: undefined,
  currentPeriodTimespan: undefined,
  busy: {
      contracts: false,
      proposal: false,
      currentPeriodTimespan: false
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

  on(actions.reset, () => initialState)
)

// TODO: merge with:
// feat/proposal-detail--introduce-time-concept
// feat/dashboard--last-fa-1.2-contract-transactions
