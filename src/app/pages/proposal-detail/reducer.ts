import { createReducer, on } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { getInitialTableState, TableState } from '@tezblock/domain/table'

export interface State {
  id: string
  proposal: ProposalDto
  loadingProposal: boolean
  votes: TableState<Transaction>
}

const initialState: State = {
  id: undefined,
  proposal: undefined,
  loadingProposal: false,
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
  on(actions.loadVotes, state => ({
    ...state,
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
  }))
)
