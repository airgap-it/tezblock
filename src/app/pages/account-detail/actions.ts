import { createAction, props } from '@ngrx/store'

const featureName = 'Account Detail'

export const loadRewardAmont = createAction(`[${featureName}] Load Reward Amont`, props<{ accountAddress: string, bakerAddress: string }>())
export const loadRewardAmontSucceeded = createAction(`[${featureName}] Load Reward Amont Succeeded`, props<{ rewardAmont: string }>())
export const loadRewardAmontFailed = createAction(`[${featureName}] Load Reward Amont Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
