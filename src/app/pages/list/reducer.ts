import { createReducer, on } from '@ngrx/store'

import * as actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Baker } from '@tezblock/services/api/api.service'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { getInitialTableState, TableState } from '@tezblock/domain/table'
import { TokenContract } from '@tezblock/domain/contract'
import { Block } from '@tezblock/interfaces/Block'
import { sort } from '@tezblock/domain/table'
import { Account } from '@tezblock/interfaces/Account'
import { getTransactionsWithErrors } from '@tezblock/domain/operations'
import { first } from '@tezblock/services/fp'

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
  tokenContracts: TableState<TokenContract>
  contracts: TableState<Account>
  transactionsChartData: actions.TransactionChartItem[]
  transactionsChartDatasets: { data: number[]; label: string }[]
}

const initialState: State = {
  blocks: getInitialTableState(sort('timestamp', 'desc')),
  transactions: getInitialTableState(sort('block_level', 'desc')),
  doubleBakings: getInitialTableState(sort('block_level', 'desc')),
  doubleEndorsements: getInitialTableState(sort('block_level', 'desc')),
  proposals: getInitialTableState({ field: 'period', direction: 'desc' }),
  activeBakers: getInitialTableState({ field: 'staking_balance', direction: 'desc' }),
  activations: getInitialTableState(sort('block_level', 'desc')),
  originations: getInitialTableState(sort('block_level', 'desc')),
  endorsements: getInitialTableState(sort('block_level', 'desc')),
  delegations: getInitialTableState(sort('block_level', 'desc')),
  votes: getInitialTableState(sort('block_level', 'desc')),
  activationsCountLast24h: undefined,
  originationsCountLast24h: undefined,
  transactionsCountLast24h: undefined,
  activationsCountLastXd: undefined,
  originationsCountLastXd: undefined,
  tokenContracts: getInitialTableState(),
  contracts: getInitialTableState(sort('balance', 'desc')),
  transactionsChartData: undefined,
  transactionsChartDatasets: undefined
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
  on(actions.sortBlocksByKind, (state, { orderBy }) => ({
    ...state,
    blocks: {
      ...state.blocks,
      orderBy
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
  on(actions.sortTransactionsByKind, (state, { orderBy }) => ({
    ...state,
    transactions: {
      ...state.transactions,
      orderBy
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
  on(actions.sortDoubleBakingsByKind, (state, { orderBy }) => ({
    ...state,
    doubleBakings: {
      ...state.doubleBakings,
      orderBy
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
  on(actions.sortDoubleEndorsementsByKind, (state, { orderBy }) => ({
    ...state,
    doubleEndorsements: {
      ...state.doubleEndorsements,
      orderBy
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
  on(actions.sortActiveBakersByKind, (state, { orderBy }) => ({
    ...state,
    activeBakers: {
      ...state.activeBakers,
      orderBy
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
  on(actions.sortProposalsByKind, (state, { orderBy }) => ({
    ...state,
    proposals: {
      ...state.proposals,
      orderBy
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
  on(actions.sortVotesByKind, (state, { orderBy }) => ({
    ...state,
    votes: {
      ...state.votes,
      orderBy
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
  on(actions.sortEndorsementsByKind, (state, { orderBy }) => ({
    ...state,
    endorsements: {
      ...state.endorsements,
      orderBy
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
  on(actions.sortActivationsByKind, (state, { orderBy }) => ({
    ...state,
    activations: {
      ...state.activations,
      orderBy
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
  on(actions.sortOriginationsByKind, (state, { orderBy }) => ({
    ...state,
    originations: {
      ...state.originations,
      orderBy
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
  on(actions.sortDelegationsByKind, (state, { orderBy }) => ({
    ...state,
    delegations: {
      ...state.delegations,
      orderBy
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
    // TODO: why selecting this data throws error in chart.js ... ?
    //transactionsChartDatasets: toTransactionsChartDataSource('Transactions', 'Total XTZ')(transactionsChartData)
  })),
  on(actions.loadTokenContracts, state => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      loading: true
    }
  })),
  on(actions.loadTokenContractsSucceeded, (state, { tokenContracts }) => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      data: tokenContracts.data,
      pagination: {
        ...state.tokenContracts.pagination,
        total: tokenContracts.total
      },
      loading: false
    }
  })),
  on(actions.loadTokenContractsFailed, state => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      loading: false
    }
  })),
  on(actions.increasePageOfTokenContracts, state => ({
    ...state,
    tokenContracts: {
      ...state.tokenContracts,
      pagination: {
        ...state.tokenContracts.pagination,
        currentPage: state.tokenContracts.pagination.currentPage + 1
      }
    }
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
      data: contracts,
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
  on(actions.sortContracts, (state, { orderBy }) => ({
    ...state,
    contracts: {
      ...state.contracts,
      orderBy
    }
  })),
  on(actions.loadTransactionsErrorsSucceeded, (state, { operationErrorsById, actionType }) => ({
    ...state,
    ...(actionType === actions.loadTransactionsSucceeded.type
      ? { transactions: getTransactionsWithErrors(operationErrorsById, state.transactions) }
      : actionType === actions.loadActivationsSucceeded.type
      ? { activations: getTransactionsWithErrors(operationErrorsById, state.activations) }
      : actionType === actions.loadOriginationsSucceeded.type
      ? { originations: getTransactionsWithErrors(operationErrorsById, state.originations) }
      : actionType === actions.loadDelegationsSucceeded.type
      ? { delegations: getTransactionsWithErrors(operationErrorsById, state.delegations) }
      : actionType === actions.loadDoubleEndorsementsSucceeded.type
      ? { doubleEndorsements: getTransactionsWithErrors(operationErrorsById, state.doubleEndorsements) }
      : actionType === actions.loadVotesSucceeded.type
      ? { votes: getTransactionsWithErrors(operationErrorsById, state.votes) }
      : actionType === actions.loadEndorsementsSucceeded.type
      ? { endorsements: getTransactionsWithErrors(operationErrorsById, state.endorsements) }
      : null)
  })),
  on(actions.reset, () => initialState)
)
