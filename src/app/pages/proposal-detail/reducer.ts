import { createReducer, on } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { MetaVotingPeriod, PeriodTimespan } from '@tezblock/domain/vote'
import { squareBrackets } from '@tezblock/domain/pattern'
import { get } from '@tezblock/services/fp'
import { numberOfBlocksToSeconds } from '@tezblock/services/cycle/cycle.service'
import * as moment from 'moment'

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

export const isEmptyPeriodKind = (periodKind: string, metaVotingPeriods: MetaVotingPeriod[] = []): boolean =>
  get<MetaVotingPeriod>(period => period.count)(metaVotingPeriods.find(period => period.periodKind === periodKind)) === 0

const processPeriodTimespans = (periodsTimespans: PeriodTimespan[], blocksPerVotingPeriod: number) => {
  const fromPeriod = (value: number, periodsBetween: number): number =>
    value + numberOfBlocksToSeconds(blocksPerVotingPeriod) * 1000 * periodsBetween

  const getFromPrevious = (index: number, array: PeriodTimespan[], isStart: boolean, originIndex: number): number => {
    if (index < 0) {
      return null
    }

    return array[index].end
      ? fromPeriod(array[index].end, originIndex - index + (isStart ? -1 : 0))
      : array[index].start
      ? fromPeriod(array[index].end, originIndex - index + (isStart ? 0 : 1))
      : getFromPrevious(index - 1, array, isStart, originIndex)
  }

  const getPeriod = (period: PeriodTimespan, index: number, array: PeriodTimespan[]): PeriodTimespan => ({
    start: period.start || getFromPrevious(index - 1, array, true, index),
    end: period.end || period.start ? fromPeriod(period.start, 1) : getFromPrevious(index - 1, array, false, index)
  })

  return periodsTimespans.map(getPeriod)
}

export interface State {
  id: string
  proposal: ProposalDto
  loadingProposal: boolean
  periodKind: string
  metaVotingPeriods: MetaVotingPeriod[]
  periodsTimespans: PeriodTimespan[]
  votes: TableState<Transaction>
  currentVotingPeriod: number
  currentVotingeriodPosition: number
  blocksPerVotingPeriod: number
}

const initialState: State = {
  id: undefined,
  proposal: undefined,
  loadingProposal: false,
  periodKind: undefined,
  metaVotingPeriods: undefined,
  periodsTimespans: undefined,
  votes: getInitialTableState(),
  currentVotingPeriod: undefined,
  currentVotingeriodPosition: undefined,
  blocksPerVotingPeriod: undefined
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
  })),
  on(actions.loadPeriodsTimespansSucceeded, (state, { periodsTimespans }) => ({
    ...state,
    periodsTimespans: processPeriodTimespans(periodsTimespans, state.blocksPerVotingPeriod)
  }))
)
