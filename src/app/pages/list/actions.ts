import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Baker } from '@tezblock/services/api/api.service'
import { ProposalListDto } from '@tezblock/interfaces/proposal'

const featureName = 'List'

export const loadDoubleBakings = createAction(`[${featureName}] Load Double Bakings`)
export const loadDoubleBakingsSucceeded = createAction(
  `[${featureName}] Load Double Bakings Succeeded`,
  props<{ doubleBakings: Transaction[] }>()
)
export const loadDoubleBakingsFailed = createAction(`[${featureName}] Load Double Bakings Failed`, props<{ error: any }>())
export const increasePageOfDoubleBakings = createAction(`[${featureName}] Increase Page Of Double Bakings`)
export const sortDoubleBakingsByKind = createAction(
  `[${featureName}] Sort Double Bakings`,
  props<{ sortingValue: string; sortingDirection: string }>()
)

export const loadDoubleEndorsements = createAction(`[${featureName}] Load Double Endorsements`)
export const loadDoubleEndorsementsSucceeded = createAction(
  `[${featureName}] Load Double Endorsements Succeeded`,
  props<{ doubleEndorsements: Transaction[] }>()
)
export const loadDoubleEndorsementsFailed = createAction(`[${featureName}] Load Double Endorsements Failed`, props<{ error: any }>())
export const increasePageOfDoubleEndorsements = createAction(`[${featureName}] Increase Page Of Double Endorsements`)

export const loadActiveBakers = createAction(`[${featureName}] Load Active Bakers`)
export const loadActiveBakersSucceeded = createAction(`[${featureName}] Load Active Bakers Succeeded`, props<{ activeBakers: Baker[] }>())
export const loadActiveBakersFailed = createAction(`[${featureName}] Load Active Bakers Failed`, props<{ error: any }>())
export const increasePageOfActiveBakers = createAction(`[${featureName}] Increase Page Of Active Bakers`)

export const loadTotalActiveBakers = createAction(`[${featureName}] Load Total Active Bakers`)
export const loadTotalActiveBakersSucceeded = createAction(
  `[${featureName}] Load Total Active Bakers Succeeded`,
  props<{ totalActiveBakers: number }>()
)
export const loadTotalActiveBakersFailed = createAction(`[${featureName}] Load Total Active Bakers Failed`, props<{ error: any }>())

export const loadProposals = createAction(`[${featureName}] Load Proposals`)
export const loadProposalsSucceeded = createAction(`[${featureName}] Load Proposals Succeeded`, props<{ proposals: ProposalListDto[] }>())
export const loadProposalsFailed = createAction(`[${featureName}] Load Proposals Failed`, props<{ error: any }>())
export const increasePageOfProposals = createAction(`[${featureName}] Increase Page Of Proposals`)

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

export const loadOriginationsCountLast24h = createAction(`[${featureName}] Load Originations Count Last 24h`)
export const loadOriginationsCountLast24hSucceeded = createAction(
  `[${featureName}] Load Originations Count Last 24h Succeeded`,
  props<{ originationsCountLast24h: number }>()
)
export const loadOriginationsCountLast24hFailed = createAction(
  `[${featureName}] Load Originations Count Last 24h Failed`,
  props<{ error: any }>()
)

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

export const reset = createAction(`[${featureName}] Reset`)
