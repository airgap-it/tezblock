import { createAction, props } from '@ngrx/store'

import { TokenContract } from '@tezblock/domain/contract'
import { Data } from '@tezblock/domain/table'

const featureName = 'Token Contract Overview'

export const loadTokenContracts = createAction(`[${featureName}] Load Token Contracts`)
export const loadTokenContractsSucceeded = createAction(
  `[${featureName}] Load Token Contracts Succeeded`,
  props<{ tokenContracts: Data<TokenContract> }>()
)
export const loadTokenContractsFailed = createAction(`[${featureName}] Load Token Contracts Failed`, props<{ error: any }>())
export const increasePageOfTokenContracts = createAction(`[${featureName}] Increase Page Of Token Contracts`)

export const reset = createAction(`[${featureName}] Reset`)
