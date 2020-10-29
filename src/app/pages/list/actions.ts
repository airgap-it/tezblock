import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Baker } from '@tezblock/services/api/api.service'
import { Block } from '@tezblock/interfaces/Block'
import { Account } from '@tezblock/domain/account'
import { OrderBy } from '@tezblock/services/base.service'
import { OperationErrorsById } from '@tezblock/domain/operations'

export interface TransactionChartItem {
  timestamp: number
  amount: number
}

const featureName = 'List'

export const loadBlocks = createAction(`[${featureName}] Load Blocks`)
export const loadBlocksSucceeded = createAction(`[${featureName}] Load Blocks Succeeded`, props<{ blocks: Block[] }>())
export const loadBlocksFailed = createAction(`[${featureName}] Load Blocks Failed`, props<{ error: any }>())
export const increasePageOfBlocks = createAction(`[${featureName}] Increase Page Of Blocks`)
export const sortBlocksByKind = createAction(`[${featureName}] Sort Blocks`, props<{ orderBy: OrderBy }>())

export const loadTransactions = createAction(`[${featureName}] Load Transactions`)
export const loadTransactionsSucceeded = createAction(
  `[${featureName}] Load Transactions Succeeded`,
  props<{ transactions: Transaction[] }>()
)
export const loadTransactionsFailed = createAction(`[${featureName}] Load Transactions Failed`, props<{ error: any }>())
export const increasePageOfTransactions = createAction(`[${featureName}] Increase Page Of Transactions`)
export const sortTransactionsByKind = createAction(`[${featureName}] Sort Transactions`, props<{ orderBy: OrderBy }>())

export const loadDoubleBakings = createAction(`[${featureName}] Load Double Bakings`)
export const loadDoubleBakingsSucceeded = createAction(
  `[${featureName}] Load Double Bakings Succeeded`,
  props<{ doubleBakings: Transaction[] }>()
)
export const loadDoubleBakingsFailed = createAction(`[${featureName}] Load Double Bakings Failed`, props<{ error: any }>())
export const increasePageOfDoubleBakings = createAction(`[${featureName}] Increase Page Of Double Bakings`)
export const sortDoubleBakingsByKind = createAction(`[${featureName}] Sort Double Bakings`, props<{ orderBy: OrderBy }>())

export const loadBlockDataForDBE = createAction(
  `[${featureName}] Load Block Data For Double Baking Evidence`,
  props<{ doubleBakings: Transaction[] }>()
)

export const loadDoubleEndorsements = createAction(`[${featureName}] Load Double Endorsements`)
export const loadDoubleEndorsementsSucceeded = createAction(
  `[${featureName}] Load Double Endorsements Succeeded`,
  props<{ doubleEndorsements: Transaction[] }>()
)

export const loadBlockDataForDEE = createAction(
  `[${featureName}] Load Block Data For Double Endorsement Evidence`,
  props<{ doubleEndorsements: Transaction[] }>()
)

export const loadDoubleEndorsementsFailed = createAction(`[${featureName}] Load Double Endorsements Failed`, props<{ error: any }>())
export const increasePageOfDoubleEndorsements = createAction(`[${featureName}] Increase Page Of Double Endorsements`)
export const sortDoubleEndorsementsByKind = createAction(`[${featureName}] Sort Double Endorsements`, props<{ orderBy: OrderBy }>())

export const loadActiveBakers = createAction(`[${featureName}] Load Active Bakers`)
export const loadActiveBakersSucceeded = createAction(`[${featureName}] Load Active Bakers Succeeded`, props<{ activeBakers: Baker[] }>())
export const loadActiveBakersFailed = createAction(`[${featureName}] Load Active Bakers Failed`, props<{ error: any }>())
export const increasePageOfActiveBakers = createAction(`[${featureName}] Increase Page Of Active Bakers`)
export const sortActiveBakersByKind = createAction(`[${featureName}] Sort Active Bakers`, props<{ orderBy: OrderBy }>())

export const loadTotalActiveBakers = createAction(`[${featureName}] Load Total Active Bakers`)
export const loadTotalActiveBakersSucceeded = createAction(
  `[${featureName}] Load Total Active Bakers Succeeded`,
  props<{ totalActiveBakers: number }>()
)
export const loadTotalActiveBakersFailed = createAction(`[${featureName}] Load Total Active Bakers Failed`, props<{ error: any }>())

export const loadProposals = createAction(`[${featureName}] Load Proposals`)
export const loadProposalsSucceeded = createAction(`[${featureName}] Load Proposals Succeeded`, props<{ proposals: ProposalDto[] }>())
export const loadProposalsFailed = createAction(`[${featureName}] Load Proposals Failed`, props<{ error: any }>())
export const increasePageOfProposals = createAction(`[${featureName}] Increase Page Of Proposals`)
export const sortProposalsByKind = createAction(`[${featureName}] Sort Proposals`, props<{ orderBy: OrderBy }>())

export const loadVotes = createAction(`[${featureName}] Load Votes`)
export const loadVotesSucceeded = createAction(`[${featureName}] Load Votes Succeeded`, props<{ votes: any[] }>())
export const loadVotesFailed = createAction(`[${featureName}] Load Votes Failed`, props<{ error: any }>())
export const increasePageOfVotes = createAction(`[${featureName}] Increase Page Of Votes`)
export const sortVotesByKind = createAction(`[${featureName}] Sort Votes`, props<{ orderBy: OrderBy }>())

export const loadEndorsements = createAction(`[${featureName}] Load Endorsements`)
export const loadEndorsementsSucceeded = createAction(
  `[${featureName}] Load Endorsements Succeeded`,
  props<{ endorsements: Transaction[] }>()
)
export const loadEndorsementsFailed = createAction(`[${featureName}] Load Endorsements Failed`, props<{ error: any }>())
export const increasePageOfEndorsements = createAction(`[${featureName}] Increase Page Of Endorsements`)
export const sortEndorsementsByKind = createAction(`[${featureName}] Sort Endorsements`, props<{ orderBy: OrderBy }>())

export const loadTransactionsCountLast24h = createAction(`[${featureName}] Load Transactions Count Last 24h`)
export const loadTransactionsCountLast24hSucceeded = createAction(
  `[${featureName}] Load Transactions Count Last 24h Succeeded`,
  props<{ transactionsCountLast24h: number }>()
)
export const loadTransactionsCountLast24hFailed = createAction(
  `[${featureName}] Load Transactions Count Last 24h Failed`,
  props<{ error: any }>()
)

export const loadActivationsCountLast24h = createAction(`[${featureName}] Load Activations Count Last 24h`)
export const loadActivationsCountLast24hSucceeded = createAction(
  `[${featureName}] Load Activations Count Last 24h Succeeded`,
  props<{ activationsCountLast24h: number }>()
)
export const loadActivationsCountLast24hFailed = createAction(
  `[${featureName}] Load Activations Count Last 24h Failed`,
  props<{ error: any }>()
)
export const loadActivations = createAction(`[${featureName}] Load Activations`)
export const loadActivationsSucceeded = createAction(
  `[${featureName}] Load Activations Succeeded`,
  props<{ transactions: Transaction[] }>()
)
export const loadActivationsFailed = createAction(`[${featureName}] Load Activations Failed`, props<{ error: any }>())
export const increasePageOfActivations = createAction(`[${featureName}] Increase Page Of Activations`)
export const sortActivationsByKind = createAction(`[${featureName}] Sort Activations`, props<{ orderBy: OrderBy }>())

export const loadOriginationsCountLast24h = createAction(`[${featureName}] Load Originations Count Last 24h`)
export const loadOriginationsCountLast24hSucceeded = createAction(
  `[${featureName}] Load Originations Count Last 24h Succeeded`,
  props<{ originationsCountLast24h: number }>()
)
export const loadOriginationsCountLast24hFailed = createAction(
  `[${featureName}] Load Originations Count Last 24h Failed`,
  props<{ error: any }>()
)
export const loadOriginations = createAction(`[${featureName}] Load Originations`)
export const loadOriginationsSucceeded = createAction(
  `[${featureName}] Load Originations Succeeded`,
  props<{ transactions: Transaction[] }>()
)
export const loadOriginationsFailed = createAction(`[${featureName}] Load Originations Failed`, props<{ error: any }>())
export const increasePageOfOriginations = createAction(`[${featureName}] Increase Page Of Originations`)
export const sortOriginationsByKind = createAction(`[${featureName}] Sort Originations`, props<{ orderBy: OrderBy }>())

export const loadDelegations = createAction(`[${featureName}] Load Delegations`)
export const loadDelegationsSucceeded = createAction(
  `[${featureName}] Load Delegations Succeeded`,
  props<{ transactions: Transaction[] }>()
)
export const loadDelegationsFailed = createAction(`[${featureName}] Load Delegations Failed`, props<{ error: any }>())
export const increasePageOfDelegations = createAction(`[${featureName}] Increase Page Of Delegations`)
export const sortDelegationsByKind = createAction(`[${featureName}] Sort Delegations`, props<{ orderBy: OrderBy }>())

export const loadTransactionsChartData = createAction(`[${featureName}] Load Transactions Chart Data`)
export const loadTransactionsChartDataSucceeded = createAction(
  `[${featureName}] Load Transactions Chart Data Succeeded`,
  props<{ transactionsChartData: TransactionChartItem[] }>()
)
export const loadTransactionsChartDataFailed = createAction(`[${featureName}] Load Transactions Chart Data Failed`, props<{ error: any }>())
export const loadTransactionsCountLastXd = createAction(`[${featureName}] Load Transactions Count Last 30d`)
export const loadTransactionsCountLastXdSucceeded = createAction(
  `[${featureName}] Load Transactions Count Last 30d Succeeded`,
  props<{ transactionsCountLastXd: number[] }>()
)
export const loadTransactionsCountLastXdFailed = createAction(
  `[${featureName}] Load Transactions Count Last 30d Failed`,
  props<{ error: any }>()
)

export const loadActivationsCountLastXd = createAction(`[${featureName}] Load Activations Count Last 30d`)
export const loadActivationsCountLastXdSucceeded = createAction(
  `[${featureName}] Load Activations Count Last 30d Succeeded`,
  props<{ activationsCountLastXd: number[] }>()
)
export const loadActivationsCountLastXdFailed = createAction(
  `[${featureName}] Load Activations Count Last 30d Failed`,
  props<{ error: any }>()
)

export const loadOriginationsCountLastXd = createAction(`[${featureName}] Load Originations Count Last 30d`)
export const loadOriginationsCountLastXdSucceeded = createAction(
  `[${featureName}] Load Originations Count Last 30d Succeeded`,
  props<{ originationsCountLastXd: number[] }>()
)
export const loadOriginationsCountLastXdFailed = createAction(
  `[${featureName}] Load Originations Count Last 30d Failed`,
  props<{ error: any }>()
)

export const loadContracts = createAction(`[${featureName}] Load Contracts`)
export const loadContractsSucceeded = createAction(`[${featureName}] Load Contracts Succeeded`, props<{ contracts: Account[] }>())
export const loadContractsFailed = createAction(`[${featureName}] Load Contracts Failed`, props<{ error: any }>())
export const increasePageOfContracts = createAction(`[${featureName}] Increase Page Of Contracts`)
export const sortContracts = createAction(`[${featureName}] Sort Contracts`, props<{ orderBy: OrderBy }>())

export const loadTransactionsErrors = createAction(
  `[${featureName}] Load Transactions Errors`,
  props<{ transactions: Transaction[]; actionType: string }>()
)
export const loadTransactionsErrorsSucceeded = createAction(
  `[${featureName}] Load Transactions Errors Succeeded`,
  props<{ operationErrorsById: OperationErrorsById[]; actionType: string }>()
)
export const loadTransactionsErrorsFailed = createAction(`[${featureName}] Load Transactions Errors Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
