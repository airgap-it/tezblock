import { createReducer, on } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'

import * as actions from './app.actions'

export interface State {
    navigationHistory: NavigationEnd[]
}

const initialState: State = {
    navigationHistory: []
}

export const reducer = createReducer(
  initialState,
  on(actions.saveLatestRoute, (state, { navigation }) => ({
    ...state,
    navigationHistory: state.navigationHistory.concat(navigation)
  }))
)
