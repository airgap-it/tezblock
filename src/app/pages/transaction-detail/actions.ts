import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Count } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'

const featureName = 'Transaction Detail'

export const loadTransactionsByHash = createAction(`[${featureName}] Load Transactions By Hash`, props<{ transactionHash: string }>())
export const loadTransactionsByHashSucceeded = createAction(
  `[${featureName}] Load Transactions By Hash Succeeded`,
  props<{ data: Transaction[] }>()
)
export const loadTransactionsByHashFailed = createAction(`[${featureName}] Load Transactions By Hash Failed`, props<{ error: any }>())

export const loadTransactionsCounts = createAction(`[${featureName}] Load Transactions Counts`)
export const loadTransactionsCountsSucceeded = createAction(`[${featureName}] Load Transactions Counts Succeeded`, props<{ counts: Count[] }>())
export const loadTransactionsCountsFailed = createAction(`[${featureName}] Load Transactions Counts Failed`, props<{ error: any }>())

export const loadLatestBlock = createAction(`[${featureName}] Load Latest Block`)
export const loadLatestBlockSucceeded = createAction(`[${featureName}] Load Latest Block Succeeded`, props<{ latestBlock: Block }>())
export const loadLatestBlockFailed = createAction(`[${featureName}] Load Latest Block Failed`, props<{ error: any }>())

export const sortTransactionsByKind = createAction(
  `[${featureName}] Sort Transactions`,
  props<{ orderBy: OrderBy }>()
)

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const reset = createAction(`[${featureName}] Reset`)
