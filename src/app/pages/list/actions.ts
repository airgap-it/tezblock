import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { ProposalListDto } from '@tezblock/interfaces/proposal'
import { Contract } from '@tezblock/domain/contract'
import { Data } from '@tezblock/domain/table'

export interface TransactionChartItem {
  timestamp: number
  amount: number
}

const featureName = 'List'

export const loadDoubleBakings = createAction(`[${featureName}] Load Double Bakings`)
export const loadDoubleBakingsSucceeded = createAction(
  `[${featureName}] Load Double Bakings Succeeded`,
  props<{ doubleBakings: Transaction[] }>()
)
export const loadDoubleBakingsFailed = createAction(`[${featureName}] Load Double Bakings Failed`, props<{ error: any }>())
export const increasePageOfDoubleBakings = createAction(`[${featureName}] Increase Page Of Double Bakings`)

export const loadDoubleEndorsements = createAction(`[${featureName}] Load Double Endorsements`)
export const loadDoubleEndorsementsSucceeded = createAction(
  `[${featureName}] Load Double Endorsements Succeeded`,
  props<{ doubleEndorsements: Transaction[] }>()
)
export const loadDoubleEndorsementsFailed = createAction(`[${featureName}] Load Double Endorsements Failed`, props<{ error: any }>())
export const increasePageOfDoubleEndorsements = createAction(`[${featureName}] Increase Page Of Double Endorsements`)

export const loadProposals = createAction(`[${featureName}] Load Proposals`)
export const loadProposalsSucceeded = createAction(
  `[${featureName}] Load Proposals Succeeded`,
  props<{ proposals: ProposalListDto[] }>()
)
export const loadProposalsFailed = createAction(`[${featureName}] Load Proposals Failed`, props<{ error: any }>())
export const increasePageOfProposals = createAction(`[${featureName}] Increase Page Of Proposals`)

export const loadTransactionsCountLast24h = createAction(`[${featureName}] Load Transactions Count Last 24h`)
export const loadTransactionsCountLast24hSucceeded = createAction(`[${featureName}] Load Transactions Count Last 24h Succeeded`, props<{ transactionsCountLast24h: number }>())
export const loadTransactionsCountLast24hFailed = createAction(`[${featureName}] Load Transactions Count Last 24h Failed`, props<{ error: any }>())

export const loadActivationsCountLast24h = createAction(`[${featureName}] Load Activations Count Last 24h`)
export const loadActivationsCountLast24hSucceeded = createAction(`[${featureName}] Load Activations Count Last 24h Succeeded`, props<{ activationsCountLast24h: number }>())
export const loadActivationsCountLast24hFailed = createAction(`[${featureName}] Load Activations Count Last 24h Failed`, props<{ error: any }>())

export const loadOriginationsCountLast24h = createAction(`[${featureName}] Load Originations Count Last 24h`)
export const loadOriginationsCountLast24hSucceeded = createAction(`[${featureName}] Load Originations Count Last 24h Succeeded`, props<{ originationsCountLast24h: number }>())
export const loadOriginationsCountLast24hFailed = createAction(`[${featureName}] Load Originations Count Last 24h Failed`, props<{ error: any }>())

export const loadTransactionsChartData = createAction(`[${featureName}] Load Transactions Chart Data`)
export const loadTransactionsChartDataSucceeded = createAction(`[${featureName}] Load Transactions Chart Data Succeeded`, props<{ transactionsChartData: TransactionChartItem[] }>())
export const loadTransactionsChartDataFailed = createAction(`[${featureName}] Load Transactions Chart Data Failed`, props<{ error: any }>())

export const loadActivationsCountLastXd = createAction(`[${featureName}] Load Activations Count Last 30d`)
export const loadActivationsCountLastXdSucceeded = createAction(`[${featureName}] Load Activations Count Last 30d Succeeded`, props<{ activationsCountLastXd: number[] }>())
export const loadActivationsCountLastXdFailed = createAction(`[${featureName}] Load Activations Count Last 30d Failed`, props<{ error: any }>())

export const loadOriginationsCountLastXd = createAction(`[${featureName}] Load Originations Count Last 30d`)
export const loadOriginationsCountLastXdSucceeded = createAction(`[${featureName}] Load Originations Count Last 30d Succeeded`, props<{ originationsCountLastXd: number[] }>())
export const loadOriginationsCountLastXdFailed = createAction(`[${featureName}] Load Originations Count Last 30d Failed`, props<{ error: any }>())

export const loadContracts = createAction(`[${featureName}] Load Contracts`)
export const loadContractsSucceeded = createAction(`[${featureName}] Load Contracts Succeeded`, props<{ contracts: Data<Contract> }>())
export const loadContractsFailed = createAction(`[${featureName}] Load Contracts Failed`, props<{ error: any }>())
export const increasePageOfContracts = createAction(`[${featureName}] Increase Page Of Contracts`)

export const reset = createAction(`[${featureName}] Reset`)
