import { createAction, props } from '@ngrx/store'

import { TokenContract, ContractOperation } from '@tezblock/domain/contract'

export interface CustomContractOperation extends ContractOperation {
    symbol: string
}

const featureName = 'Dashboard Latest Contracts Transactions'

export const loadContracts = createAction(`[${featureName}] Load Contracts`)
export const loadContractsSucceeded = createAction(`[${featureName}] Load Contracts Succeeded`, props<{ contracts: TokenContract[] }>())
export const loadContractsFailed = createAction(`[${featureName}] Load Contracts Failed`, props<{ error: any }>())

export const loadTransferOperations = createAction(`[${featureName}] Load Transfer Operations`, props<{ contracts: TokenContract[] }>())
export const loadTransferOperationsSucceeded = createAction(`[${featureName}] Load Transfer Operations Succeeded`, props<{ transferOperations: CustomContractOperation[] }>())
export const loadTransferOperationsFailed = createAction(`[${featureName}] Load Transfer Operations Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
