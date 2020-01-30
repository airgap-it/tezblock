import { createAction, props } from '@ngrx/store'

import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Transaction } from '@tezblock/interfaces/Transaction'

const featureName = 'Proposal Details'

export const reset = createAction(`[${featureName}] Reset`)

export const loadProposal = createAction(`[${featureName}] Load Proposal`, props<{ id: string }>())
export const loadProposalSucceeded = createAction(`[${featureName}] Load Proposal Succeeded`, props<{ proposal: ProposalDto }>())
export const loadProposalFailed = createAction(`[${featureName}] Load Proposal Failed`, props<{ error: any }>())

export const loadVotes = createAction(`[${featureName}] Load Votes`)
export const loadVotesSucceeded = createAction(`[${featureName}] Load Votes Succeeded`, props<{ votes: Transaction[] }>())
export const loadVotesFailed = createAction(`[${featureName}] Load Votes Failed`, props<{ error: any }>())
