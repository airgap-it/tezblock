import { InjectionToken } from '@angular/core';
import {
  Action,
  ActionReducer,
  ActionReducerMap,
  combineReducers,
  createSelector,
  MetaReducer
} from '@ngrx/store';

import { environment } from '../../environments/environment';
import * as fromEndorsementDetails from "../pages/endorsement-detail/reducer";

export interface State {
  endorsementDetails: fromEndorsementDetails.State
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const ROOT_REDUCERS = new InjectionToken<
  ActionReducerMap<State, Action>
>('Root reducers token', {
  factory: () => ({
    endorsementDetails: fromEndorsementDetails.reducer
  }),
});

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state, action) => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('prev state', state);
    console.log('action', action);
    console.log('next state', result);
    console.groupEnd();

    return result;
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production ? [logger] : [];
