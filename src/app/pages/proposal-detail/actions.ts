import { createAction, props } from '@ngrx/store'

import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { MetaVotingPeriod, PeriodTimespan, DivisionOfVotes } from '@tezblock/domain/vote'

const featureName = 'Proposal Details'

export const reset = createAction(`[${featureName}] Reset`)

export const loadProposal = createAction(`[${featureName}] Load Proposal`, props<{ id: string }>())
export const loadProposalSucceeded = createAction(`[${featureName}] Load Proposal Succeeded`, props<{ proposal: ProposalDto }>())
export const loadProposalFailed = createAction(`[${featureName}] Load Proposal Failed`, props<{ error: any }>())

// startLoadingVotes -> loadMetaVotingPeriods -> loadVotes -> loadVotesTotal
export const startLoadingVotes = createAction(`[${featureName}] Start Loading Votes`, props<{ periodKind: string }>())

export const loadMetaVotingPeriods = createAction(`[${featureName}] Load Meta Voting Periods`)
export const loadMetaVotingPeriodsSucceeded = createAction(
  `[${featureName}] Load Meta Voting Periods Succeeded`,
  props<{ metaVotingPeriods: MetaVotingPeriod[] }>()
)
export const loadMetaVotingPeriodsFailed = createAction(`[${featureName}] Load Meta Voting Periods Failed`, props<{ error: any }>())

export const loadVotes = createAction(`[${featureName}] Load Votes`, props<{ periodKind: string }>())
export const loadVotesSucceeded = createAction(`[${featureName}] Load Votes Succeeded`, props<{ votes: Transaction[] }>())
export const loadVotesFailed = createAction(`[${featureName}] Load Votes Failed`, props<{ error: any }>())

export const loadVotesTotal = createAction(`[${featureName}] Load Votes Total`)
export const loadVotesTotalSucceeded = createAction(
  `[${featureName}] Load Votes Total Succeeded`,
  props<{ metaVotingPeriods: MetaVotingPeriod[] }>()
)
export const loadVotesTotalFailed = createAction(`[${featureName}] Load Votes Total Failed`, props<{ error: any }>())

export const loadPeriodsTimespans = createAction(`[${featureName}] Load Periods Timespans`)
export const loadPeriodsTimespansSucceeded = createAction(
  `[${featureName}] Load Periods Timespans Succeeded`,
  props<{ periodsTimespans: PeriodTimespan[]; blocksPerVotingPeriod: number }>()
)
export const loadPeriodsTimespansFailed = createAction(`[${featureName}] Load Periods Timespans Failed`, props<{ error: any }>())

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const loadProposalDescription = createAction(`[${featureName}] Load Proposal Description`)
export const loadProposalDescriptionSucceeded = createAction(
  `[${featureName}] Load Proposal Description Succeeded`,
  props<{ description: string }>()
)
export const loadProposalDescriptionFailed = createAction(`[${featureName}] Load Proposal Description Failed`, props<{ error: any }>())

export const loadDivisionOfVotes = createAction(`[${featureName}] Load Division Of Votes`, props<{ votingPeriod: number }>())
export const loadDivisionOfVotesSucceeded = createAction(
  `[${featureName}] Load Division Of Votes Succeeded`,
  props<{ divisionOfVotes: DivisionOfVotes[] }>()
)
export const loadDivisionOfVotesFailed = createAction(`[${featureName}] Load Division Of Votes Failed`, props<{ error: any }>())