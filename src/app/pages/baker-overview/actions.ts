import { createAction, props } from '@ngrx/store'

import { Baker } from '@tezblock/services/api/api.service'

const featureName = 'Bakers'

export const loadActiveBakers = createAction(`[${featureName}] Load Active Bakers`)
export const loadActiveBakersSucceeded = createAction(`[${featureName}] Load Active Bakers Succeeded`, props<{ activeBakers: Baker[] }>())
export const loadActiveBakersFailed = createAction(`[${featureName}] Load Active Bakers Failed`, props<{ error: any }>())
export const increasePageOfActiveBakers = createAction(`[${featureName}] Increase Page Of Active Bakers`)
export const sortActiveBakersByKind = createAction(
  `[${featureName}] Sort Active Bakers`,
  props<{ sortingValue: string; sortingDirection: string }>()
)

export const loadTop24Bakers = createAction(`[${featureName}] Load Top 24 Bakers`)
export const loadTop24BakersSucceeded = createAction(`[${featureName}] Load Top 24 Bakers Succeeded`, props<{ top24Bakers: Baker[] }>())
export const loadTop24BakersFailed = createAction(`[${featureName}] Load Top 24 Bakers Failed`, props<{ error: any }>())

export const loadTotalActiveBakers = createAction(`[${featureName}] Load Total Active Bakers`)
export const loadTotalActiveBakersSucceeded = createAction(
  `[${featureName}] Load Total Active Bakers Succeeded`,
  props<{ totalActiveBakers: number }>()
)
export const loadTotalActiveBakersFailed = createAction(`[${featureName}] Load Total Active Bakers Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
