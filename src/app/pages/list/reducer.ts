import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'

interface TableState<T> {
  data: T[]
  pagination: {
    currentPage: number
    selectedSize: number
    pageSizes: [number, number, number, number]
  }
  loading: boolean
}

const getInitialTableState = (): TableState<any> => ({
  data: [],
  pagination: {
    currentPage: 1,
    selectedSize: 10,
    pageSizes: [5, 10, 20, 50]
  },
  loading: false
})

export interface State {
  doubleBakings: TableState<Transaction>
  doubleEndorsements: TableState<Transaction>
}

const initialState: State = {
  doubleBakings: getInitialTableState(),
  doubleEndorsements: getInitialTableState()
}

export const reducer = createReducer(
  initialState,
  on(actions.loadDoubleBakings, (state) => ({
    ...state,
    doubleBakings: {
        ...state.doubleBakings,
        loading: true
    }
  })),
  on(actions.loadDoubleBakingsSucceeded, (state, { doubleBakings }) => ({
    ...state,
    doubleBakings: {
        ...state.doubleBakings,
        data: doubleBakings,
        loading: false
    }
  })),
  on(actions.loadDoubleBakingsFailed, (state) => ({
    ...state,
    doubleBakings: {
        ...state.doubleBakings,
        loading: false
    }
  })),
  on(actions.increasePageOfDoubleBakings, (state) => ({
    ...state,
    doubleBakings: {
        ...state.doubleBakings,
        pagination: {
            ...state.doubleBakings.pagination,
            currentPage: state.doubleBakings.pagination.currentPage + 1
        }
    }
  })),
  on(actions.loadDoubleEndorsements, (state) => ({
    ...state,
    doubleEndorsements: {
        ...state.doubleEndorsements,
        loading: true
    }
  })),
  on(actions.loadDoubleEndorsementsSucceeded, (state, { doubleEndorsements }) => ({
    ...state,
    doubleEndorsements: {
        ...state.doubleEndorsements,
        data: doubleEndorsements,
        loading: false
    }
  })),
  on(actions.loadDoubleEndorsementsFailed, (state) => ({
    ...state,
    doubleEndorsements: {
        ...state.doubleEndorsements,
        loading: false
    }
  })),
  on(actions.increasePageOfDoubleEndorsements, (state) => ({
    ...state,
    doubleEndorsements: {
        ...state.doubleEndorsements,
        pagination: {
            ...state.doubleEndorsements.pagination,
            currentPage: state.doubleEndorsements.pagination.currentPage + 1
        }
    }
  }))
)
