import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Baker } from '@tezblock/services/api/api.service'

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
