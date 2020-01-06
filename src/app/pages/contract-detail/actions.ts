import { createAction, props } from '@ngrx/store'

import { Contract } from '@tezblock/domain/contract'
import { Transaction } from '@tezblock/interfaces/Transaction'

const featureName = 'Contract Detail'

export const loadContract = createAction(`[${featureName}] Load Contract`, props<{ address: string }>())
export const loadContractSucceeded = createAction(`[${featureName}] Load Contract Succeeded`, props<{ contract: Contract }>())
export const loadContractFailed = createAction(`[${featureName}] Load Contract Failed`, props<{ error: any }>())

export const copyAddressToClipboard = createAction(`[${featureName}] Copy Address To Clipboard`, props<{ address: string }>())
export const copyAddressToClipboardSucceeded = createAction(`[${featureName}] Copy Address To Clipboard Succeeded`)
export const resetCopyToClipboardState = createAction(`[${featureName}] Reset Copy To Clipboard State`)

export const loadTransferOperations = createAction(`[${featureName}] Load Transfer Operations`, props<{ address: string }>())
export const loadTransferOperationsSucceeded = createAction(`[${featureName}] Load Transfer Operations Succeeded`, props<{ transferOperations: Transaction[] }>())
export const loadTransferOperationsFailed = createAction(`[${featureName}] Load Transfer Operations Failed`, props<{ error: any }>())
export const loadMoreTransferOperations = createAction(`[${featureName}] Load More Transfer Operations`)

export const showQr = createAction(`[${featureName}] Show Qr`)

export const showTelegramModal = createAction(`[${featureName}] Show Telegram Modal`)

export const reset = createAction(`[${featureName}] Reset`)
