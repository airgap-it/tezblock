import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { TableState, getInitialTableState } from '@tezblock/domain/table'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { Contract } from '@tezblock/domain/contract'

export interface State {
  doubleBakings: TableState<Transaction>
  doubleEndorsements: TableState<Transaction>
  proposals: TableState<ProposalListDto>
  activationsCountLast24h: number
  originationsCountLast24h: number
  transactionsCountLast24h: number
  activationsCountLastXd: number[]
  originationsCountLastXd: number[]
  transactionsChartData: actions.TransactionChartItem[]
  contracts: TableState<Contract>
}

const initialState: State = {
  doubleBakings: getInitialTableState(),
  doubleEndorsements: getInitialTableState(),
  proposals: getInitialTableState(),
  activationsCountLast24h: undefined,
  originationsCountLast24h: undefined,
  transactionsCountLast24h: undefined,
  activationsCountLastXd: undefined,
  originationsCountLastXd: undefined,
  transactionsChartData: undefined,
  contracts: getInitialTableState()
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
  on(actions.loadProposals, state => ({
    ...state,
    proposals: {
      ...state.proposals,
      loading: true
    }
  })),
  on(actions.loadProposalsSucceeded, (state, { proposals }) => ({
    ...state,
    proposals: {
      ...state.proposals,
      data: proposals,
      loading: false
    }
  })),
  on(actions.loadProposalsFailed, state => ({
    ...state,
    proposals: {
      ...state.proposals,
      loading: false
    }
  })),
  on(actions.increasePageOfProposals, state => ({
    ...state,
    proposals: {
      ...state.proposals,
      pagination: {
        ...state.proposals.pagination,
        currentPage: state.proposals.pagination.currentPage + 1
      }
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
  on(actions.loadActivationsCountLastXdSucceeded, (state, { activationsCountLastXd }) => ({
    ...state,
    activationsCountLastXd
  })),
  on(actions.loadOriginationsCountLastXdSucceeded, (state, { originationsCountLastXd }) => ({
    ...state,
    originationsCountLastXd
  })),
  on(actions.loadTransactionsChartDataSucceeded, (state, { transactionsChartData }) => ({
    ...state,
    transactionsChartData
  })),
  on(actions.loadContracts, state => ({
    ...state,
    contracts: {
      ...state.contracts,
      loading: true
    }
  })),
  on(actions.loadContractsSucceeded, (state, { contracts }) => ({
    ...state,
    contracts: {
      ...state.contracts,
      data: contracts.data,
      pagination: {
        ...state.contracts.pagination,
        total: contracts.total
      },
      loading: false
    }
  })),
  on(actions.loadContractsFailed, state => ({
    ...state,
    contracts: {
      ...state.contracts,
      loading: false
    }
  })),
  on(actions.increasePageOfContracts, state => ({
    ...state,
    contracts: {
      ...state.contracts,
      pagination: {
        ...state.contracts.pagination,
        currentPage: state.contracts.pagination.currentPage + 1
      }
    }
  })),
  on(actions.reset, () => initialState)
)
