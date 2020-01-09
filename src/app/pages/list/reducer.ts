import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Baker } from '@tezblock/services/api/api.service'

const preprocessBakersData = (bakerData: any[]) =>
  bakerData.map(bakerDataItem => ({
    ...bakerDataItem,
    number_of_votes: bakerDataItem.staking_balance ? Math.floor(bakerDataItem.staking_balance / (8000 * 1000000)) : null
  }))

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
  activeBakers: {
    table: TableState<Baker>
    total: number //TODO: move to pagination ?
  }
  activationsCountLast24h: number
  originationsCountLast24h: number
  transactionsCountLast24h: number
}

const initialState: State = {
  doubleBakings: getInitialTableState(),
  doubleEndorsements: getInitialTableState(),
  activeBakers: {
    table: getInitialTableState(),
    total: undefined
  },
  activationsCountLast24h: undefined,
  originationsCountLast24h: undefined,
  transactionsCountLast24h: undefined
}

export const reducer = createReducer(
  initialState,
  on(actions.loadDoubleBakings, state => ({
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
  on(actions.loadDoubleBakingsFailed, state => ({
    ...state,
    doubleBakings: {
      ...state.doubleBakings,
      loading: false
    }
  })),
  on(actions.increasePageOfDoubleBakings, state => ({
    ...state,
    doubleBakings: {
      ...state.doubleBakings,
      pagination: {
        ...state.doubleBakings.pagination,
        currentPage: state.doubleBakings.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadDoubleEndorsements, state => ({
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
  on(actions.loadDoubleEndorsementsFailed, state => ({
    ...state,
    doubleEndorsements: {
      ...state.doubleEndorsements,
      loading: false
    }
  })),
  on(actions.increasePageOfDoubleEndorsements, state => ({
    ...state,
    doubleEndorsements: {
      ...state.doubleEndorsements,
      pagination: {
        ...state.doubleEndorsements.pagination,
        currentPage: state.doubleEndorsements.pagination.currentPage + 1
      }
    }
  })),
  on(actions.loadActiveBakers, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      table: {
        ...state.activeBakers.table,
        loading: true
      }
    }
  })),
  on(actions.loadActiveBakersSucceeded, (state, { activeBakers }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      table: {
        ...state.activeBakers.table,
        data: preprocessBakersData(activeBakers),
        loading: false
      }
    }
  })),
  on(actions.loadActiveBakersFailed, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      table: {
        ...state.activeBakers.table,
        loading: false
      }
    }
  })),
  on(actions.increasePageOfActiveBakers, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      table: {
        ...state.activeBakers.table,
        pagination: {
          ...state.activeBakers.table.pagination,
          currentPage: state.activeBakers.table.pagination.currentPage + 1
        }
      }
    }
  })),
  on(actions.loadTotalActiveBakers, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      total: undefined
    }
  })),
  on(actions.loadTotalActiveBakersSucceeded, (state, { totalActiveBakers }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      total: totalActiveBakers
    }
  })),
  on(actions.loadTotalActiveBakersFailed, state => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      total: null
    }
  })),
  on(actions.loadActivationsCountLast24hSucceeded, (state, { activationsCountLast24h }) => ({
    ...state,
    activationsCountLast24h
  })),
  on(actions.loadOriginationsCountLast24hSucceeded, (state, { originationsCountLast24h }) => ({
    ...state,
    originationsCountLast24h
  })),
  on(actions.loadTransactionsCountLast24hSucceeded, (state, { transactionsCountLast24h }) => ({
    ...state,
    transactionsCountLast24h
  })),
  on(actions.reset, () => initialState)
)
