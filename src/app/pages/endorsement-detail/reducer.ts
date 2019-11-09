import { createReducer, on } from '@ngrx/store'

import * as Actions from './actions';
import { Transaction } from '@tezblock/interfaces/Transaction'

export interface State {
  endorsements: Transaction[]
}

const initialState: State = {
  endorsements: []
}

export const reducer = createReducer(
  initialState,
  on(Actions.loadEndorsementsSucceeded, (state, { endorsements }) => ({
    endorsements
  })),
)

export const getEndorsements = (state: State) => state.endorsements
