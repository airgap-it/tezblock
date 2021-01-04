import { createAction, props } from '@ngrx/store'
import { OrderBy } from '@tezblock/services/base.service'

import { Heatmap, Node } from './model'

const featureName = 'Connected Nodes'

export const loadConnectedNodes = createAction(`[${featureName}] Load Connected Nodes`)
export const loadConnectedNodesSucceeded = createAction(`[${featureName}] Load Connected Nodes Succeeded`, props<{ data: Node[] }>())
export const loadConnectedNodesFailed = createAction(`[${featureName}] Load Connected Nodes Failed`, props<{ error: any }>())
export const loadMoreConnectedNodes = createAction(`[${featureName}] Load More Connected Nodes`)

export const loadConnectedNodesPerCountry = createAction(`[${featureName}] Load Connected Nodes Per Country`)
export const loadConnectedNodesPerCountrySucceeded = createAction(`[${featureName}] Load Connected Nodes Per Country Succeeded`, props<{ connectedNodesPerCountry: Heatmap[] }>())
export const loadConnectedNodesPerCountryFailed = createAction(`[${featureName}] Load Connected Nodes Per Country Failed`, props<{ error: any }>())

export const sortNodes = createAction(`[${featureName}] Sort Connected Nodes`, props<{ orderBy: OrderBy }>())

export const reset = createAction(`[${featureName}] Reset`)
