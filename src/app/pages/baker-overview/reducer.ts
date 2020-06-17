import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Baker } from '@tezblock/services/api/api.service'
import { getInitialTableState, TableState } from '@tezblock/domain/table'

export const othersBakersLabel = 'Others'

const preprocessBakersData = (bakerData: any[]) =>
  bakerData.map(bakerDataItem => ({
    ...bakerDataItem,
    number_of_votes: bakerDataItem.staking_balance ? Math.floor(bakerDataItem.staking_balance / (8000 * 1000000)) : null
  }))

export interface State {
  activeBakers: TableState<Baker>
  top24Bakers: Baker[]
  top24BakersLoading: boolean
}
export interface Sorting {
  direction: string
  value: string
}

export const initialState: State = {
  activeBakers: getInitialTableState({ field: 'staking_balance', direction: 'desc' }),
  top24Bakers: undefined,
  top24BakersLoading: false
}

export const reducer = createReducer(
  initialState,
  on(actions.loadActiveBakers, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      loading: true
    }
  })),
  on(actions.loadActiveBakersSucceeded, (state, { activeBakers }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      data: preprocessBakersData(activeBakers),
      loading: false
    }
  })),
  on(actions.loadActiveBakersFailed, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      loading: false
    }
  })),
  on(actions.loadTop24Bakers, state => ({
    ...state,
    top24BakersLoading: true
  })),
  on(actions.loadTop24BakersSucceeded, (state, { top24Bakers }) => ({
    ...state,
    top24Bakers,
    top24BakersLoading: false
  })),
  on(actions.loadTop24BakersFailed, state => ({
    ...state,
    top24BakersLoading: false
  })),
  on(actions.increasePageOfActiveBakers, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      pagination: {
        ...state.activeBakers.pagination,
        currentPage: state.activeBakers.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadTotalActiveBakers, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      pagination: {
        ...state.activeBakers.pagination,
        total: undefined
      }
    }
  })),
  on(actions.loadTotalActiveBakersSucceeded, (state, { totalActiveBakers }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      pagination: {
        ...state.activeBakers.pagination,
        total: totalActiveBakers
      }
    }
  })),
  on(actions.loadTotalActiveBakersFailed, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      pagination: {
        ...state.activeBakers.pagination,
        total: null
      }
    }
  })),
  on(actions.reset, () => initialState),
  on(actions.sortActiveBakersByKind, (state, { orderBy }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      orderBy
    }
  }))
)
