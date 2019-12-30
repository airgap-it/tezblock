import { InjectionToken } from '@angular/core'
import { Action, ActionReducer, ActionReducerMap, combineReducers, createSelector, MetaReducer, Store } from '@ngrx/store'
import { take } from 'rxjs/operators'

import { environment } from '../../environments/environment'
import * as fromEndorsementDetails from '../pages/endorsement-detail/reducer'
import * as fromList from '../pages/list/reducer'
import * as accountDetails from '../pages/account-detail/reducer'
import * as blockDetails from '../pages/block-detail/reducer'
import * as transactionDetails from '../pages/transaction-detail/reducer'
import * as bakerTable from '../components/baker-table/reducer'

export interface State {
  accountDetails: accountDetails.State
  bakerTable: bakerTable.State
  blockDetails: blockDetails.State
  endorsementDetails: fromEndorsementDetails.State
  transactionDetails: transactionDetails.State
  list: fromList.State
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const ROOT_REDUCERS = new InjectionToken<ActionReducerMap<State, Action>>('Root reducers token', {
  factory: () => ({
    accountDetails: accountDetails.reducer,
    bakerTable: bakerTable.reducer,
    blockDetails: blockDetails.reducer,
    endorsementDetails: fromEndorsementDetails.reducer,
    transactionDetails: transactionDetails.reducer,
    list: fromList.reducer
  })
})

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state, action) => {
    const result = reducer(state, action)
    console.groupCollapsed(action.type)
    console.log('prev state', state)
    console.log('action', action)
    console.log('next state', result)
    console.groupEnd()

    return result
  }
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [logger] : []

export const getState = (store: Store<State>): State => {
  let state: State

  store.pipe(take(1)).subscribe(s => (state = s))

  return state
}

export const selectBlockDetails = (state: State) => state.blockDetails;

// TODO: refactor, it's too long
export const selector = {
  blockDetails: {
    id: createSelector(selectBlockDetails, state => state.id),
    block: createSelector(selectBlockDetails, state => state.block)
  }
}