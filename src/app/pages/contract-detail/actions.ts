import { createAction, props } from '@ngrx/store'

import { TokenContract, ContractOperation, TokenHolder } from '@tezblock/domain/contract'
import { OrderBy } from '@tezblock/services/base.service'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { OperationErrorsById } from '@tezblock/domain/operations'

const featureName = 'Contract Detail'

export enum OperationTab {
  transfers = 'transfers',
  other = 'other',
  tokenHolders = 'token holders'
}

export const loadContract = createAction(`[${featureName}] Load Contract`, props<{ address: string }>())
export const loadContractSucceeded = createAction(`[${featureName}] Load Contract Succeeded`, props<{ contract: TokenContract }>())
export const loadContractFailed = createAction(`[${featureName}] Load Contract Failed`, props<{ error: any }>())

export const loadManagerAddress = createAction(`[${featureName}] Load Manager Address`, props<{ address: string }>())
export const loadManagerAddressSucceeded = createAction(`[${featureName}] Load Manager Address Succeeded`, props<{ manager: string }>())
export const loadManagerAddressFailed = createAction(`[${featureName}] Load Manager Address Failed`, props<{ error: any }>())

export const copyAddressToClipboard = createAction(`[${featureName}] Copy Address To Clipboard`, props<{ address: string }>())
export const copyAddressToClipboardSucceeded = createAction(`[${featureName}] Copy Address To Clipboard Succeeded`)
export const resetCopyToClipboardState = createAction(`[${featureName}] Reset Copy To Clipboard State`)

export const loadTransferOperations = createAction(`[${featureName}] Load Transfer Operations`, props<{ contract: TokenContract }>())
export const loadTransferOperationsSucceeded = createAction(
  `[${featureName}] Load Transfer Operations Succeeded`,
  props<{ data: ContractOperation[] }>()
)
export const loadTransferOperationsFailed = createAction(`[${featureName}] Load Transfer Operations Failed`, props<{ error: any }>())
export const loadMoreTransferOperations = createAction(`[${featureName}] Load More Transfer Operations`)
// export const sortTransferOperations = createAction(`[${featureName}] Sort Transfer Operations`, props<{ orderBy: OrderBy }>())

export const loadOtherOperations = createAction(`[${featureName}] Load Other Operations`, props<{ contract: TokenContract }>())
export const loadOtherOperationsSucceeded = createAction(
  `[${featureName}] Load Other Operations Succeeded`,
  props<{ data: ContractOperation[] }>()
)
export const loadOtherOperationsFailed = createAction(`[${featureName}] Load Other Operations Failed`, props<{ error: any }>())
export const loadMoreOtherOperations = createAction(`[${featureName}] Load More Other Operations`)
export const sortOtherOperations = createAction(`[${featureName}] Sort Other Operations`, props<{ orderBy: OrderBy }>())

export const loadTokenHolders = createAction(`[${featureName}] Load Token Holders`, props<{ contract: TokenContract }>())
export const loadTokenHoldersSucceeded = createAction(`[${featureName}] Load Token Holders Succeeded`, props<{ data: TokenHolder[] }>())
export const loadTokenHoldersFailed = createAction(`[${featureName}] Load Token Holders Failed`, props<{ error: any }>())
export const loadMoreTokenHolders = createAction(`[${featureName}] Load More Token Holders`)

export const loadOperationsCount = createAction(`[${featureName}] Load Operations Count`, props<{ contractHash: string }>())
export const loadOperationsCountSucceeded = createAction(
  `[${featureName}] Load Operations Count Succeeded`,
  props<{ transferTotal: number; otherTotal: number }>()
)
export const loadOperationsCountFailed = createAction(`[${featureName}] Load Operations Count Failed`, props<{ error: any }>())

export const loadTransactionsErrors = createAction(`[${featureName}] Load Transactions Errors`, props<{ transactions: Transaction[] }>())
export const loadTransactionsErrorsSucceeded = createAction(
  `[${featureName}] Load Transactions Errors Succeeded`,
  props<{ operationErrorsById: OperationErrorsById[] }>()
)
export const loadTransactionsErrorsFailed = createAction(`[${featureName}] Load Transactions Errors Failed`, props<{ error: any }>())

export const changeOperationsTab = createAction(`[${featureName}] Change Operations Tab`, props<{ currentTabKind: OperationTab }>())

export const loadMore = createAction(`[${featureName}] Load More`)

export const sortOperations = createAction(`[${featureName}] Sort Operations`, props<{ orderBy: OrderBy }>())

export const showQr = createAction(`[${featureName}] Show Qr`)

export const showTelegramModal = createAction(`[${featureName}] Show Telegram Modal`)

export const reset = createAction(`[${featureName}] Reset`)
