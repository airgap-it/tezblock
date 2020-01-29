import { createReducer, on } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ProposalDto } from '@tezblock/interfaces/proposal'

export interface State {
  id: string
  proposal: ProposalDto
  loading: boolean
}

const initialState: State = {
  id: undefined,
  proposal: undefined,
  loading: false
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
    loading: false
  })),
  on(actions.loadProposalFailed, state => ({
    ...state,
    proposal: null,
    loading: false
  }))
)
