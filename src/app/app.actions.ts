import { createAction, props } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'

import { Block } from '@tezblock/interfaces/Block'

const featureName = 'App'

export const saveLatestRoute = createAction(`[${featureName}] Save Latest Route`, props<{ navigation: NavigationEnd }>())

export const loadLatestBlock = createAction(`[${featureName}] Load LatestBlock`)
export const loadLatestBlockSucceeded = createAction(`[${featureName}] Load LatestBlock Succeeded`, props<{ latestBlock: Block }>())
export const loadLatestBlockFailed = createAction(`[${featureName}] Load LatestBlock Failed`, props<{ error: any }>())

export const loadFirstBlockOfCycle = createAction(`[${featureName}] Load First Block Of Cycle`, props<{ cycle: number }>())
export const loadFirstBlockOfCycleSucceeded = createAction(`[${featureName}] Load First Block Of Cycle Succeeded`, props<{ firstBlockOfCycle: Block }>())
export const loadFirstBlockOfCycleFailed = createAction(`[${featureName}] Load First Block Of Cycle Failed`, props<{ error: any }>())

export const loadPeriodInfos = createAction(`[${featureName}] Load Period Infos`)
export const loadPeriodInfosSucceeded = createAction(
  `[${featureName}] Load Period Infos Succeeded`,
  props<{ currentVotingPeriod: number; currentVotingeriodPosition: number, blocksPerVotingPeriod: number }>()
)
export const loadPeriodInfosFailed = createAction(`[${featureName}] Load Period Infos Failed`, props<{ error: any }>())
