import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'
import { GetDelegatedAccountsResponseDto } from '@tezblock/services/account/account.service'

const featureName = 'Account Detail'

export const loadRewardAmont = createAction(`[${featureName}] Load Reward Amont`, props<{ accountAddress: string, bakerAddress: string }>())
export const loadRewardAmontSucceeded = createAction(`[${featureName}] Load Reward Amont Succeeded`, props<{ rewardAmont: string }>())
export const loadRewardAmontFailed = createAction(`[${featureName}] Load Reward Amont Failed`, props<{ error: any }>())

export const loadTransactionsByKind = createAction(`[${featureName}] Load Transactions By Kind`, props<{ kind: string }>())
export const loadTransactionsByKindSucceeded = createAction(`[${featureName}] Load Transactions By Kind Succeeded`, props<{ data: Transaction[] }>())
export const loadTransactionsByKindFailed = createAction(`[${featureName}] Load Transactions By Kind Failed`, props<{ error: any }>())

export const loadAccount = createAction(`[${featureName}] Load Account`, props<{ address: string }>())
export const loadAccountSucceeded = createAction(`[${featureName}] Load Account Succeeded`, props<{ account: Account }>())
export const loadAccountFailed = createAction(`[${featureName}] Load Account Failed`, props<{ error: any }>())

export const loadDelegatedAccountsSucceeded = createAction(`[${featureName}] Load Delegated Accounts Succeeded`, props<{ accounts: GetDelegatedAccountsResponseDto }>())
export const loadDelegatedAccountsFailed = createAction(`[${featureName}] Load Delegated Accounts Failed`, props<{ error: any }>())

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const reset = createAction(`[${featureName}] Reset`)
