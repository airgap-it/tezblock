import { createAction, props } from '@ngrx/store'

import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'

const featureName = 'Account Detail - Bekker Table'

export const setAccountAddress = createAction(`[${featureName}] Set Account Address`, props<{ accountAddress: string }>())

export const loadBakingRights = createAction(`[${featureName}] Load Baking Rights`)
export const loadBakingRightsSucceeded = createAction(`[${featureName}] Load Baking Rights Succeeded`, props<{ bakingRights: AggregatedBakingRights[] }>())
export const loadBakingRightsFailed = createAction(`[${featureName}] Load Baking Rights Failed`, props<{ error: any }>())

export const loadEndorsingRights = createAction(`[${featureName}] Load Endorsing Rights`)
export const loadEndorsingRightsSucceeded = createAction(`[${featureName}] Load Endorsing Rights Succeeded`, props<{ endorsingRights: AggregatedEndorsingRights[] }>())
export const loadEndorsingRightsFailed = createAction(`[${featureName}] Load Endorsing Rights Failed`, props<{ error: any }>())

export const increaseRightsPageSize = createAction(`[${featureName}] Change Rights Page Size`)

export const kindChanged = createAction(`[${featureName}] Kind Changed`, props<{ kind: string }>())

export const reset = createAction(`[${featureName}] Reset`)
