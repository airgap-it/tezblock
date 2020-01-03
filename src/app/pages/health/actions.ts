import { createAction, props } from '@ngrx/store'

import { BlockStatus } from '@tezblock/services/health/health.service'

const featureName = 'Health'

export const loadLatestNodeBlock = createAction(`[${featureName}] Load Latest Node Block`)
export const loadLatestNodeBlockSucceeded = createAction(`[${featureName}] Load Latest Node Block Succeeded`, props<{ latestNodeBlock: any }>())
export const loadLatestNodeBlockFailed = createAction(`[${featureName}] Load Latest Node Block Failed`, props<{ error: any }>())

export const loadLatestConseilBlock = createAction(`[${featureName}] Load Latest Conseil Block`)
export const loadLatestConseilBlockSucceeded = createAction(`[${featureName}] Load Latest Conseil Block Succeeded`, props<{ latestConseilBlock: BlockStatus }>())
export const loadLatestConseilBlockFailed = createAction(`[${featureName}] Load Latest Conseil Block Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
