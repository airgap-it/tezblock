import { createAction, props } from '@ngrx/store'
import { TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'
import { GetDelegatedAccountsResponseDto } from '@tezblock/services/account/account.service'
import { Balance } from '@tezblock/services/api/api.service'
import { Count } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'
import { OperationErrorsById } from '@tezblock/domain/operations'

export interface BakingRatingResponse {
  bakingRating: string
  tezosBakerFee: number
}

const featureName = 'Account Detail'

export const loadRewardAmont = createAction(`[${featureName}] Load Reward Amont`, props<{ accountAddress: string; bakerAddress: string }>())
export const loadRewardAmontSucceeded = createAction(`[${featureName}] Load Reward Amont Succeeded`, props<{ rewardAmont: string }>())
export const loadRewardAmontFailed = createAction(`[${featureName}] Load Reward Amont Failed`, props<{ error: any }>())

export const loadTransactionsByKind = createAction(
  `[${featureName}] Load Transactions By Kind`,
  props<{ kind: string; orderBy?: OrderBy }>()
)
export const loadTransactionsByKindSucceeded = createAction(
  `[${featureName}] Load Transactions By Kind Succeeded`,
  props<{ data: Transaction[] }>()
)
export const loadTransactionsByKindFailed = createAction(`[${featureName}] Load Transactions By Kind Failed`, props<{ error: any }>())

export const loadTransactionsCounts = createAction(`[${featureName}] Load Transactions Counts`)
export const loadTransactionsCountsSucceeded = createAction(
  `[${featureName}] Load Transactions Counts Succeeded`,
  props<{ counts: Count[] }>()
)
export const loadTransactionsCountsFailed = createAction(`[${featureName}] Load Transactions Counts Failed`, props<{ error: any }>())

export const loadAccount = createAction(`[${featureName}] Load Account`, props<{ address: string }>())
export const loadAccountSucceeded = createAction(`[${featureName}] Load Account Succeeded`, props<{ account: Account }>())
export const loadAccountFailed = createAction(`[${featureName}] Load Account Failed`, props<{ error: any }>())

export const loadDelegatedAccountsSucceeded = createAction(
  `[${featureName}] Load Delegated Accounts Succeeded`,
  props<{ accounts: GetDelegatedAccountsResponseDto }>()
)
export const loadDelegatedAccountsFailed = createAction(`[${featureName}] Load Delegated Accounts Failed`, props<{ error: any }>())

export const loadBalanceForLast30Days = createAction(`[${featureName}] Load Balance For Last 30 Days`, props<{ address: string }>())
export const loadBalanceForLast30DaysSucceeded = createAction(
  `[${featureName}] Load Balance For Last 30 Days Succeeded`,
  props<{ balanceFromLast30Days: Balance[] }>()
)
export const loadBalanceForLast30DaysFailed = createAction(`[${featureName}] Load Balance For Last 30 Days Failed`, props<{ error: any }>())

export const loadExtraBalance = createAction(`[${featureName}] Load Extra Balance`, props<{ temporaryBalance: Balance[] }>())
export const loadExtraBalanceSucceeded = createAction(`[${featureName}] Load Extra Balance Succeeded`, props<{ extraBalance: Balance[] }>())
export const loadExtraBalanceFailed = createAction(`[${featureName}] Load Extra Balance Failed`, props<{ error: any }>())

export const loadBakingBadRatings = createAction(`[${featureName}] Load Baking Bad Ratings`, props<{ address: string }>())
export const loadBakingBadRatingsSucceeded = createAction(
  `[${featureName}] Load Baking Bad Ratings Succeeded`,
  props<{ response: BakingRatingResponse }>()
)
export const loadBakingBadRatingsFailed = createAction(`[${featureName}] Load Baking Bad Ratings Failed`, props<{ error: any }>())

export const loadTezosBakerRating = createAction(
  `[${featureName}] Load Tezos Baker Rating`,
  props<{ address: string; updateFee: boolean }>()
)
export const loadTezosBakerRatingSucceeded = createAction(
  `[${featureName}] Load Tezos Baker Rating Succeeded`,
  props<{ response: BakingRatingResponse; address: string; updateFee: boolean }>()
)
export const loadTezosBakerRatingFailed = createAction(`[${featureName}] Load Tezos Baker Rating Failed`, props<{ error: any }>())

export const sortTransactionsByKind = createAction(`[${featureName}] Sort Transactions`, props<{ orderBy: OrderBy }>())

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const loadTransactionsErrors = createAction(`[${featureName}] Load Transactions Errors`, props<{ transactions: Transaction[] }>())
export const loadTransactionsErrorsSucceeded = createAction(
  `[${featureName}] Load Transactions Errors Succeeded`,
  props<{ operationErrorsById: OperationErrorsById[] }>()
)
export const loadTransactionsErrorsFailed = createAction(`[${featureName}] Load Transactions Errors Failed`, props<{ error: any }>())

export const loadBakerReward = createAction(`[${featureName}] Load Baker Reward`, props<{ bakerAddress: string }>())
export const loadBakerRewardSucceeded = createAction(`[${featureName}] Load Baker Reward Succeeded`, props<{ bakerReward: TezosPayoutInfo }>())
export const loadBakerRewardFailed = createAction(`[${featureName}] Load Baker Reward Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
