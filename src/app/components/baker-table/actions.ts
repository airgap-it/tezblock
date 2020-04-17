import { createAction, props } from '@ngrx/store'
import { TezosRewards, TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { Transaction } from '@tezblock/interfaces/Transaction'

export interface LevelInTime {
  estimated_time: number
  level: number
}

export interface UpcomingRights {
  baking: LevelInTime
  endorsing: LevelInTime
}

const featureName = 'Account Detail - Baker Table'

export const setAccountAddress = createAction(`[${featureName}] Set Account Address`, props<{ accountAddress: string }>())

export const loadCurrentCycleThenRights = createAction(`[${featureName}] Load Current Cycle Then Rights`)
export const loadCurrentCycleThenRightsSucceeded = createAction(
  `[${featureName}] Load Current Cycle Then Rights Succeeded`,
  props<{ currentCycle: number }>()
)
export const loadCurrentCycleThenRightsFailed = createAction(
  `[${featureName}] Load Current Cycle Then Rights Failed`,
  props<{ error: any }>()
)

export const loadBakingRights = createAction(`[${featureName}] Load Baking Rights`)
export const loadBakingRightsSucceeded = createAction(
  `[${featureName}] Load Baking Rights Succeeded`,
  props<{ bakingRights: AggregatedBakingRights[] }>()
)
export const loadBakingRightsFailed = createAction(`[${featureName}] Load Baking Rights Failed`, props<{ error: any }>())

export const loadEndorsingRights = createAction(`[${featureName}] Load Endorsing Rights`)
export const loadEndorsingRightsSucceeded = createAction(
  `[${featureName}] Load Endorsing Rights Succeeded`,
  props<{ endorsingRights: AggregatedEndorsingRights[] }>()
)
export const loadEndorsingRightsFailed = createAction(`[${featureName}] Load Endorsing Rights Failed`, props<{ error: any }>())

export const loadEfficiencyLast10Cycles = createAction(`[${featureName}] Load Efficiency Last 10 Cycles`)
export const loadEfficiencyLast10CyclesSucceeded = createAction(
  `[${featureName}] Load Efficiency Last 10 Cycles Succeeded`,
  props<{ efficiencyLast10Cycles: number }>()
)
export const loadEfficiencyLast10CyclesFailed = createAction(
  `[${featureName}] Load Efficiency Last 10 Cycles Failed`,
  props<{ error: any }>()
)

export const loadUpcomingRights = createAction(`[${featureName}] Load Upcoming Rights`)
export const loadUpcomingRightsSucceeded = createAction(
  `[${featureName}] Load Upcoming Rights Succeeded`,
  props<{ upcomingRights: UpcomingRights }>()
)
export const loadUpcomingRightsFailed = createAction(`[${featureName}] Load Upcoming Rights Failed`, props<{ error: any }>())

export const loadActiveDelegations = createAction(`[${featureName}] Load Active Delegations`)
export const loadActiveDelegationsSucceeded = createAction(
  `[${featureName}] Load Active Delegations Succeeded`,
  props<{ activeDelegations: number }>()
)
export const loadActiveDelegationsFailed = createAction(`[${featureName}] Load Active Delegations Failed`, props<{ error: any }>())

export const loadRewards = createAction(`[${featureName}] Load Rewards`)
export const loadRewardsSucceeded = createAction(`[${featureName}] Load Rewards Succeeded`, props<{ rewards: TezosRewards[] }>())
export const loadRewardsFailed = createAction(`[${featureName}] Load Rewards Failed`, props<{ error: any }>())
export const increaseRewardsPageSize = createAction(`[${featureName}] Change Rewards Page Size`)

export const loadPayouts = createAction(`[${featureName}] Load Payouts`, props<{ cycle: number, filter: string }>())
export const loadPayoutsSucceeded = createAction(`[${featureName}] Load Payouts Succeeded`, props<{ cycle: number, payouts: TezosPayoutInfo[] }>())
export const loadPayoutsFailed = createAction(`[${featureName}] Load Payouts Failed`, props<{ cycle: number, error: any }>())

export const increaseRightsPageSize = createAction(`[${featureName}] Change Rights Page Size`)

export const loadVotes = createAction(`[${featureName}] Load Votes`)
export const loadVotesSucceeded = createAction(`[${featureName}] Load Votes Succeeded`, props<{ data: Transaction[] }>())
export const loadVotesFailed = createAction(`[${featureName}] Load Votes Failed`, props<{ error: any }>())
export const increaseVotesPageSize = createAction(`[${featureName}] Change Votes Page Size`)

export const loadBakerReward = createAction(`[${featureName}] Load Baker Rewards`, props<{ baker: string, cycle: number }>())
export const loadBakerRewardSucceeded = createAction(`[${featureName}] Load Baker Rewards Succeeded`, props<{ cycle: number, bakerReward: TezosPayoutInfo }>())
export const loadBakerRewardFailed = createAction(`[${featureName}] Load Baker Rewards Failed`, props<{ cycle: number, error: any }>())

export const kindChanged = createAction(`[${featureName}] Kind Changed`, props<{ kind: string }>())

export const reset = createAction(`[${featureName}] Reset`)
