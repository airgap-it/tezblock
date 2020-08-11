import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { Count } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'
import { OperationErrorsById } from '@tezblock/domain/operations'

const featureName = 'Block Detail'

export const loadBlock = createAction(`[${featureName}] Load Block`, props<{ id: string }>())
export const loadBlockSucceeded = createAction(`[${featureName}] Load Block Succeeded`, props<{ block: Block }>())
export const loadBlockFailed = createAction(`[${featureName}] Load Block Failed`, props<{ error: any }>())

// TODO: remove block argument when it'll be in store
export const loadOperationsByKind = createAction(`[${featureName}] Load Operations By Kind`, props<{ blockHash: string; kind: string }>())
export const loadOperationsByKindSucceeded = createAction(
  `[${featureName}] Load Operations By Kind Succeeded`,
  props<{ data: Transaction[] }>()
)
export const loadOperationsByKindFailed = createAction(`[${featureName}] Load Operations By Kind Failed`, props<{ error: any }>())
export const sortOperationsByKind = createAction(`[${featureName}] Sort Operations`, props<{ orderBy: OrderBy }>())

export const loadTransactions = createAction(`[${featureName}] Load Transactions`, props<{ blockHash: string }>())
export const loadTransactionsSucceeded = createAction(
  `[${featureName}] Load Transactions Succeeded`,
  props<{ data: Transaction[] }>()
)
export const loadTransactionsFailed = createAction(`[${featureName}] Load Transactions Failed`, props<{ error: any }>())

export const changeBlock = createAction(`[${featureName}] Change Block`, props<{ change: number }>())

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const loadOperationsCounts = createAction(`[${featureName}] Load Operations Counts`)
export const loadOperationsCountsSucceeded = createAction(
  `[${featureName}] Load Operations Counts Succeeded`,
  props<{ counts: Count[] }>()
)
export const loadOperationsCountsFailed = createAction(`[${featureName}] Load Operations Counts Failed`, props<{ error: any }>())

export const loadTransactionsErrors = createAction(`[${featureName}] Load Transactions Errors`, props<{ transactions: Transaction[] }>())
export const loadTransactionsErrorsSucceeded = createAction(
  `[${featureName}] Load Transactions Errors Succeeded`,
  props<{ operationErrorsById: OperationErrorsById[] }>()
)
export const loadTransactionsErrorsFailed = createAction(`[${featureName}] Load Transactions Errors Failed`, props<{ error: any }>())

export const reset = createAction(`[${featureName}] Reset`)
