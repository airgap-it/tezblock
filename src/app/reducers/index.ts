import { InjectionToken } from '@angular/core'
import { Action, ActionReducer, ActionReducerMap, combineReducers, createSelector, MetaReducer, Store } from '@ngrx/store'
import { take } from 'rxjs/operators'

import { environment } from '../../environments/environment'
import * as fromEndorsementDetails from '../pages/endorsement-detail/reducer'
import * as fromList from '../pages/list/reducer'
import * as fromAccountDetails from '../pages/account-detail/reducer'
import * as fromBlockDetails from '../pages/block-detail/reducer'
import * as fromTransactionDetails from '../pages/transaction-detail/reducer'
import * as fromProposalDetails from '../pages/proposal-detail/reducer'
import * as fromBakerTable from '../components/baker-table/reducer'
import * as fromContractDetails from '../pages/contract-detail/reducer'
import * as fromBakers from '../pages/baker-overview/reducer'
import * as fromApp from '../app.reducer'

export interface State {
  app: fromApp.State
  accountDetails: fromAccountDetails.State
  bakerTable: fromBakerTable.State
  bakers: fromBakers.State
  blockDetails: fromBlockDetails.State
  endorsementDetails: fromEndorsementDetails.State
  transactionDetails: fromTransactionDetails.State
  proposalDetails: fromProposalDetails.State
contractDetails: fromContractDetails.State
  list: fromList.State
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const ROOT_REDUCERS = new InjectionToken<ActionReducerMap<State, Action>>('Root reducers token', {
  factory: () => ({
    app: fromApp.reducer,
    accountDetails: fromAccountDetails.reducer,
    bakerTable: fromBakerTable.reducer,
    bakers: fromBakers.reducer,
    blockDetails: fromBlockDetails.reducer,
    endorsementDetails: fromEndorsementDetails.reducer,
    transactionDetails: fromTransactionDetails.reducer,
    proposalDetails: fromProposalDetails.reducer,
contractDetails: fromContractDetails.reducer,
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

export const selectBlockDetails = (state: State) => state.blockDetails
export const selectApp = (state: State) => state.app

export const blockDetails = {
  id: createSelector(
    selectBlockDetails,
    state => state.id
  ),
  block: createSelector(
    selectBlockDetails,
    state => state.block
  )
}

export const app = {
  currentCycle: createSelector(
    selectApp,
    fromApp.currentCycleSelector
  ),
  currentBlockLevel: createSelector(
    selectApp,
    fromApp.currentBlockLevelSelector
  )
}
