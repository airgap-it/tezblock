import { createReducer, on } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { MetaVotingPeriod, PeriodTimespan, fillMissingPeriodTimespans } from '@tezblock/domain/vote'
import { get } from '@tezblock/services/fp'

const updateMetaVotingPeriods = (metaVotingPeriods: MetaVotingPeriod[], state: State, property: string): MetaVotingPeriod[] => {
  if (!state.metaVotingPeriods) {
    return metaVotingPeriods
  }

  return metaVotingPeriods.map(metaVotingPeriod => {
    const match = state.metaVotingPeriods.find(_metaVotingPeriod => _metaVotingPeriod.periodKind === metaVotingPeriod.periodKind)

    return { ...match, [property]: metaVotingPeriod[property] }
  })
}

export const isEmptyPeriodKind = (periodKind: string, metaVotingPeriods: MetaVotingPeriod[] = []): boolean =>
  get<MetaVotingPeriod>(period => period.count)(metaVotingPeriods.find(period => period.periodKind === periodKind)) === 0

export interface State {
  id: string
  proposal: ProposalDto
  loadingProposal: boolean
  periodKind: string
  metaVotingPeriods: MetaVotingPeriod[]
  periodsTimespans: PeriodTimespan[]
  votes: TableState<Transaction>
}

const initialState: State = {
  id: undefined,
  proposal: undefined,
  loadingProposal: false,
  periodKind: undefined,
  metaVotingPeriods: undefined,
  periodsTimespans: undefined,
  votes: getInitialTableState()
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
    proposal: proposal || null,
    loadingProposal: false
  })),
  on(actions.loadProposalFailed, state => ({
    ...state,
    proposal: null,
    loadingProposal: false
  })),
  on(actions.startLoadingVotes, (state, { periodKind }) => ({
    ...state,
    periodKind
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
  on(actions.loadPeriodsTimespansSucceeded, (state, { periodsTimespans, blocksPerVotingPeriod }) => ({
    ...state,
    periodsTimespans: fillMissingPeriodTimespans(periodsTimespans, blocksPerVotingPeriod)
  })),
  on(actions.loadProposalDescriptionSucceeded, (state, { description }) => ({
    ...state,
    proposal: {
      ...state.proposal,
      description
    }
  }))
)
