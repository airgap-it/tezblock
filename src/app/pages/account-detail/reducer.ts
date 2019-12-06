import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'

export interface Busy {
    rewardAmont: boolean
}

export interface State {
    rewardAmont: string,
    busy: Busy
}

const initialState: State = {
    rewardAmont: undefined,
    busy: {
        rewardAmont: false
    }
}

export const reducer = createReducer(
  initialState,
  on(actions.loadRewardAmont, state => ({
    ...state,
    busy: {
        rewardAmont: true
    }
  })),
  on(actions.loadRewardAmontSucceeded, (state, { rewardAmont }) => ({
    ...state,
    rewardAmont,
    busy: {
        rewardAmont: false
    }
  })),
  on(actions.loadRewardAmontFailed, state => ({
    ...state,
    busy: {
        rewardAmont: false
    }
  })),
  on(actions.reset, () => initialState)
)
