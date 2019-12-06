import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Account } from '@tezblock/interfaces/Account'

const featureName = 'Account Detail'

export const loadRewardAmont = createAction(`[${featureName}] Load Reward Amont`, props<{ accountAddress: string, bakerAddress: string }>())
export const loadRewardAmontSucceeded = createAction(`[${featureName}] Load Reward Amont Succeeded`, props<{ rewardAmont: string }>())
export const loadRewardAmontFailed = createAction(`[${featureName}] Load Reward Amont Failed`, props<{ error: any }>())

// TODO: remove address when it will be in the store
export const loadDataByKind = createAction(`[${featureName}] Load Data By Kind`, props<{ kind: string, address: string }>())
export const loadDataByKindSucceeded = createAction(`[${featureName}] Load Data By Kind Succeeded`, props<{ data: Transaction[] }>())
export const loadDataByKindFailed = createAction(`[${featureName}] Load Data By Kind Failed`, props<{ error: any }>())

export const loadAccount = createAction(`[${featureName}] Load Account`, props<{ address: string }>())
export const loadAccountSucceeded = createAction(`[${featureName}] Load Account Succeeded`, props<{ account: Account }>())
export const lloadAccountFailed = createAction(`[${featureName}] Load Account Failed`, props<{ error: any }>())

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const reset = createAction(`[${featureName}] Reset`)
