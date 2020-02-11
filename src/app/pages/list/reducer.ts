import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Baker } from '@tezblock/services/api/api.service'
import { TableState, getInitialTableState } from '@tezblock/domain/table'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { Block } from '@tezblock/interfaces/Block'

const preprocessBakersData = (bakerData: any[]) =>
  bakerData.map(bakerDataItem => ({
    ...bakerDataItem,
    number_of_votes: bakerDataItem.staking_balance ? Math.floor(bakerDataItem.staking_balance / (8000 * 1000000)) : null
  }))

export interface State {
  blocks: TableState<Block>
  transactions: TableState<Transaction>
  doubleBakings: TableState<Transaction>
  doubleEndorsements: TableState<Transaction>
  proposals: TableState<ProposalListDto>
  activeBakers: TableState<Baker>
  activations: TableState<Transaction>
  originations: TableState<Transaction>
  endorsements: TableState<Transaction>
  activationsCountLast24h: number
  originationsCountLast24h: number
  transactionsCountLast24h: number

  activationsCountLastXd: number[]
  originationsCountLastXd: number[]
  transactionsCountLastXd: number[]
}

const initialState: State = {
  blocks: getInitialTableState(),
  transactions: getInitialTableState(),
  doubleBakings: getInitialTableState(),
  doubleEndorsements: getInitialTableState(),
  proposals: getInitialTableState(),
  activeBakers: getInitialTableState(),
  activations: getInitialTableState(),
  originations: getInitialTableState(),
  endorsements: getInitialTableState(),
  activationsCountLast24h: undefined,
  originationsCountLast24h: undefined,
  transactionsCountLast24h: undefined,
  activationsCountLastXd: undefined,
  originationsCountLastXd: undefined,
  transactionsCountLastXd: undefined
}

export const reducer = createReducer(
  initialState,

  on(actions.loadBlocks, state => ({
    ...state,
    blocks: {
      ...state.blocks,
      loading: true
    }
  })),

  on(actions.loadBlocksFailed, state => ({
    ...state,
    blocks: {
      ...state.blocks,
      loading: false
    }
  })),

  on(actions.loadAdditionalBlockData, (state, { blocks }) => ({
    ...state,
    blocks: {
      ...state.blocks,
      data: blocks,
      loading: true
    }
  })),

  on(actions.loadAdditionalBlockDataSucceeded, (state, { blocks }) => ({
    ...state,
    blocks: {
      ...state.blocks,
      data: blocks,
      loading: false
    }
  })),

  on(actions.loadAdditionalBlockDataFailed, state => ({
    ...state,
    blocks: {
      ...state.blocks,
      loading: false
    }
  })),

  on(actions.increasePageOfBlocks, state => ({
    ...state,
    blocks: {
      ...state.blocks,
      pagination: {
        ...state.blocks.pagination,
        currentPage: state.blocks.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortBlocksByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    blocks: {
      ...state.blocks,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
    }
  })),

  on(actions.loadTransactions, state => ({
    ...state,
    transactions: {
      ...state.transactions,
      loading: true
    }
  })),
  on(actions.loadTransactionsSucceeded, (state, { transactions }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      data: transactions,
      loading: false
    }
  })),
  on(actions.loadTransactionsFailed, state => ({
    ...state,
    transactions: {
      ...state.transactions,
      loading: false
    }
  })),
  on(actions.increasePageOfTransactions, state => ({
    ...state,
    transactions: {
      ...state.transactions,
      pagination: {
        ...state.transactions.pagination,
        currentPage: state.transactions.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortTransactionsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
    }
  })),

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
  on(actions.sortDoubleBakingsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    doubleBakings: {
      ...state.doubleBakings,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
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
  on(actions.sortDoubleEndorsementsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    doubleEndorsements: {
      ...state.doubleEndorsements,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
    }
  })),
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
  on(actions.sortActiveBakersByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
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
  on(actions.sortProposalsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    proposals: {
      ...state.proposals,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
    }
  })),

  on(actions.loadEndorsements, state => ({
    ...state,
    endorsements: {
      ...state.endorsements,
      loading: true
    }
  })),
  on(actions.loadEndorsementsSucceeded, (state, { endorsements }) => ({
    ...state,
    endorsements: {
      ...state.endorsements,
      data: endorsements,
      loading: false
    }
  })),
  on(actions.loadDoubleEndorsementsFailed, state => ({
    ...state,
    endorsements: {
      ...state.endorsements,
      loading: false
    }
  })),
  on(actions.increasePageOfEndorsements, state => ({
    ...state,
    endorsements: {
      ...state.endorsements,
      pagination: {
        ...state.endorsements.pagination,
        currentPage: state.endorsements.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortEndorsementsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    endorsements: {
      ...state.endorsements,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
    }
  })),

  on(actions.loadActivations, state => ({
    ...state,
    activations: {
      ...state.activations,
      loading: true
    }
  })),
  on(actions.loadActivationsSucceeded, (state, { transactions }) => ({
    ...state,
    activations: {
      ...state.activations,
      data: transactions,
      loading: false
    }
  })),
  on(actions.loadActivationsFailed, state => ({
    ...state,
    activations: {
      ...state.activations,
      loading: false
    }
  })),
  on(actions.increasePageOfActivations, state => ({
    ...state,
    activations: {
      ...state.activations,
      pagination: {
        ...state.activations.pagination,
        currentPage: state.activations.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortActivationsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    activations: {
      ...state.activations,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
    }
  })),

  on(actions.loadOriginations, state => ({
    ...state,
    originations: {
      ...state.originations,
      loading: true
    }
  })),
  on(actions.loadOriginationsSucceeded, (state, { transactions }) => ({
    ...state,
    originations: {
      ...state.originations,
      data: transactions,
      loading: false
    }
  })),
  on(actions.loadOriginationsFailed, state => ({
    ...state,
    originations: {
      ...state.originations,
      loading: false
    }
  })),
  on(actions.increasePageOfOriginations, state => ({
    ...state,
    originations: {
      ...state.originations,
      pagination: {
        ...state.originations.pagination,
        currentPage: state.originations.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortOriginationsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    originations: {
      ...state.originations,
      sortingDirection: sortingDirection,
      sortingValue: sortingValue
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
  on(actions.loadTransactionsCountLastXdSucceeded, (state, { transactionsCountLastXd }) => ({
    ...state,
    transactionsCountLastXd
  })),
  on(actions.reset, () => initialState)
)
