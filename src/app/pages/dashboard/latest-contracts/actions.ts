import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Contract } from '@tezblock/domain/contract'

const featureName = 'Dashboard Latest Comntracts'

export const loadContracts = createAction(`[${featureName}] Load Contracts`)
export const loadContractsSucceeded = createAction(`[${featureName}] Load Contracts Succeeded`, props<{ contracts: Contract[] }>())
export const loadContractsFailed = createAction(`[${featureName}] Load Contracts Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
