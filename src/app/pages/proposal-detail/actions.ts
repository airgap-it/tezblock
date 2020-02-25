import { createAction, props } from '@ngrx/store'

import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { MetaVotingPeriod } from '@tezblock/domain/vote'

const featureName = 'Proposal Details'

export const reset = createAction(`[${featureName}] Reset`)

export const loadProposal = createAction(`[${featureName}] Load Proposal`, props<{ id: string }>())
export const loadProposalSucceeded = createAction(`[${featureName}] Load Proposal Succeeded`, props<{ proposal: ProposalDto }>())
export const loadProposalFailed = createAction(`[${featureName}] Load Proposal Failed`, props<{ error: any }>())

export const loadVotes = createAction(`[${featureName}] Load Votes`, props<{ periodKind: string }>())
export const loadVotesSucceeded = createAction(`[${featureName}] Load Votes Succeeded`, props<{ votes: Transaction[] }>())
export const loadVotesFailed = createAction(`[${featureName}] Load Votes Failed`, props<{ error: any }>())

export const loadMetaVotingPeriods = createAction(`[${featureName}] Load Meta Voting Periods`)
export const loadMetaVotingPeriodsSucceeded = createAction(
  `[${featureName}] Load Meta Voting Periods Succeeded`,
  props<{ metaVotingPeriods: MetaVotingPeriod[] }>()
)
export const loadMetaVotingPeriodsFailed = createAction(`[${featureName}] Load Meta Voting Periods Failed`, props<{ error: any }>())

export const loadVotesTotal = createAction(`[${featureName}] Load Votes Total`)
export const loadVotesTotalSucceeded = createAction(
  `[${featureName}] Load Votes Total Succeeded`,
  props<{ metaVotingPeriods: MetaVotingPeriod[] }>()
)
export const loadVotesTotalFailed = createAction(`[${featureName}] Load Votes Total Failed`, props<{ error: any }>())

export const loadCurrentVotingPeriod = createAction(`[${featureName}] Load Current Voting Period`)
export const loadCurrentVotingPeriodSucceeded = createAction(
  `[${featureName}] Load Current Voting Period Succeeded`,
  props<{ currentVotingPeriod: number; currentVotingeriodPosition: number }>()
)
export const loadCurrentVotingPeriodFailed = createAction(`[${featureName}] Load Current Voting Period Failed`, props<{ error: any }>())

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)
