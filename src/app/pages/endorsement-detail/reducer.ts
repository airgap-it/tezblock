import { createReducer, on } from '@ngrx/store'

import * as Actions from './actions';
import { Transaction } from '@tezblock/interfaces/Transaction'

export interface State {
  endorsements: Transaction[]
  selectedEndorsement: Transaction
}

const initialState: State = {
  endorsements: undefined,
  selectedEndorsement: undefined
}

export const reducer = createReducer(
  initialState,
  on(Actions.loadEndorsementsSucceeded, (state, { endorsements }) => ({
    ...state,
    endorsements
  })),
  on(Actions.endorsementSelected, (state, { endorsement }) => ({
    ...state,
    selectedEndorsement: endorsement
  })),
)

export const getEndorsements = (state: State) => state.endorsements
export const getSelectedEndorsement = (state: State) => state.selectedEndorsement
