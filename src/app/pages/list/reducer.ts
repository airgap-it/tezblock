import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Baker } from '@tezblock/services/api/api.service'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { Contract } from '@tezblock/domain/contract'
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
  delegations: TableState<Transaction>
  votes: TableState<Transaction>
  activationsCountLast24h: number
  originationsCountLast24h: number
  transactionsCountLast24h: number
  activationsCountLastXd: number[]
  originationsCountLastXd: number[]
  transactionsCountLastXd: number[]
  contracts: TableState<Contract>
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
  delegations: getInitialTableState(),
  votes: getInitialTableState(),
  activationsCountLast24h: undefined,
  originationsCountLast24h: undefined,
  transactionsCountLast24h: undefined,
  activationsCountLastXd: undefined,
  originationsCountLastXd: undefined,
  transactionsCountLastXd: undefined,
  contracts: getInitialTableState()
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
  on(actions.loadBlocksSucceeded, (state, { blocks }) => ({
    ...state,
    blocks: {
      ...state.blocks,
      data: blocks,
      loading: false
    }
  })),
  on(actions.loadBlocksFailed, state => ({
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
      sorting: {
        ...state.blocks.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
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
      sorting: {
        ...state.transactions.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
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
      sorting: {
        ...state.doubleBakings.sorting,
        direction: sortingDirection,
        value: sortingValue
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
  on(actions.sortDoubleEndorsementsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    doubleEndorsements: {
      ...state.doubleEndorsements,
      sorting: {
        ...state.doubleEndorsements.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
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
      data: activeBakers,
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
      sorting: {
        ...state.activeBakers.sorting,
        direction: sortingDirection,
        value: sortingValue
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
      sorting: {
        ...state.proposals.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
    }
  })),

  on(actions.loadVotes, state => ({
    ...state,
    votes: {
      ...state.votes,
      loading: true
    }
  })),
  on(actions.loadVotesSucceeded, (state, { votes }) => ({
    ...state,
    votes: {
      ...state.votes,
      data: votes,
      loading: false
    }
  })),
  on(actions.loadVotesFailed, state => ({
    ...state,
    votes: {
      ...state.votes,
      loading: false
    }
  })),
  on(actions.increasePageOfVotes, state => ({
    ...state,
    votes: {
      ...state.votes,
      pagination: {
        ...state.votes.pagination,
        currentPage: state.votes.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortVotesByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    votes: {
      ...state.votes,
      sorting: {
        ...state.votes.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
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
      sorting: {
        ...state.endorsements.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
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
      sorting: {
        ...state.activations.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
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
      sorting: {
        ...state.originations.sorting,
        direction: sortingDirection,
        value: sortingValue
      }
    }
  })),

  on(actions.loadDelegations, state => ({
    ...state,
    delegations: {
      ...state.delegations,
      loading: true
    }
  })),
  on(actions.loadDelegationsSucceeded, (state, { transactions }) => ({
    ...state,
    delegations: {
      ...state.delegations,
      data: transactions,
      loading: false
    }
  })),
  on(actions.loadDelegationsFailed, state => ({
    ...state,
    delegations: {
      ...state.delegations,
      loading: false
    }
  })),
  on(actions.increasePageOfDelegations, state => ({
    ...state,
    delegations: {
      ...state.delegations,
      pagination: {
        ...state.delegations.pagination,
        currentPage: state.delegations.pagination.currentPage + 1
      }
    }
  })),
  on(actions.sortDelegationsByKind, (state, { sortingValue, sortingDirection }) => ({
    ...state,
    delegations: {
      ...state.delegations,
      sorting: {
        ...state.delegations.sorting,
        direction: sortingDirection,
        value: sortingValue
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
  on(actions.loadTransactionsCountLastXdSucceeded, (state, { transactionsCountLastXd }) => ({
    ...state,
    transactionsCountLastXd
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
