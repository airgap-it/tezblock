import { createReducer, on } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { MetaVotingPeriod } from '@tezblock/domain/vote'
import { squareBrackets } from '@tezblock/domain/pattern'

const updateMetaVotingPeriods = (metaVotingPeriods: MetaVotingPeriod[], state: State, property: string): MetaVotingPeriod[] => {
  if (!state.metaVotingPeriods) {
    return metaVotingPeriods
  }

  return metaVotingPeriods.map(metaVotingPeriod => {
    const match = state.metaVotingPeriods.find(_metaVotingPeriod => _metaVotingPeriod.periodKind === metaVotingPeriod.periodKind)

    return { ...match, [property]: metaVotingPeriod[property] }
  })
}

const processProposal = (proposal: ProposalDto): ProposalDto =>
  proposal ? { ...proposal, proposal: proposal.proposal.replace(squareBrackets, '') } : proposal

export interface State {
  id: string
  proposal: ProposalDto
  loadingProposal: boolean
  periodKind: string
  metaVotingPeriods: MetaVotingPeriod[]
  votes: TableState<Transaction>
  currentVotingPeriod: number
  currentVotingeriodPosition: number
}

const initialState: State = {
  id: undefined,
  proposal: undefined,
  loadingProposal: false,
  periodKind: undefined,
  metaVotingPeriods: undefined,
  votes: getInitialTableState(),
  currentVotingPeriod: undefined,
  currentVotingeriodPosition: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.reset, () => initialState),
  on(actions.loadProposal, (state, { id }) => ({
    ...state,
    id,
    loading: true
  })),
  on(actions.loadProposalSucceeded, (state, { proposal }) => ({
    ...state,
    proposal: processProposal(proposal) || null,
    loadingProposal: false
  })),
  on(actions.loadProposalFailed, state => ({
    ...state,
    proposal: null,
    loadingProposal: false
  })),
  on(actions.loadMetaVotingPeriodsSucceeded, (state, { metaVotingPeriods }) => ({
    ...state,
    metaVotingPeriods: updateMetaVotingPeriods(metaVotingPeriods, state, 'value')
  })),
  on(actions.loadVotesTotalSucceeded, (state, { metaVotingPeriods }) => ({
    ...state,
    metaVotingPeriods: updateMetaVotingPeriods(metaVotingPeriods, state, 'count')
  })),
  on(actions.loadMetaVotingPeriodsFailed, state => ({
    ...state,
    votes: {
      ...state.votes,
      loading: false
    }
  })),
  on(actions.loadVotes, (state, { periodKind }) => ({
    ...state,
    periodKind,
    votes: {
      ...state.votes,
      loading: true
    }
  })),
  on(actions.loadVotesSucceeded, (state, { votes }) => ({
    ...state,
    votes: {
      ...state.votes,
      data: votes,
      loading: false
    }
  })),
  on(actions.loadVotesFailed, state => ({
    ...state,
    votes: {
      ...state.votes,
      loading: false
    }
  })),
  on(actions.increasePageSize, state => ({
    ...state,
    votes: {
      ...state.votes,
      pagination: {
        ...state.votes.pagination,
        currentPage: state.votes.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadCurrentVotingPeriodSucceeded, (state, { currentVotingPeriod, currentVotingeriodPosition }) => ({
    ...state,
    currentVotingPeriod,
    currentVotingeriodPosition
  })),
  on(actions.loadCurrentVotingPeriodFailed, state => ({
    ...state,
    currentVotingPeriod: null,
    currentVotingeriodPosition: null
  }))
)
