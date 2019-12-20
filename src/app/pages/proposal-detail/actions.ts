import { createAction, props } from '@ngrx/store'

import { ProposalDto } from '@tezblock/interfaces/proposal'

const featureName = 'Proposal Details'

export const reset = createAction(`[${featureName}] Reset`)

export const loadProposal = createAction(`[${featureName}] Load Proposal`, props<{ id: string }>())
export const loadProposalSucceeded = createAction(`[${featureName}] Load Proposal Succeeded`, props<{ proposal: ProposalDto }>())
export const loadProposalFailed = createAction(`[${featureName}] Load Proposal Failed`, props<{ error: any }>())
