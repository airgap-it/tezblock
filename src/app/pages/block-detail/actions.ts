import { createAction, props } from '@ngrx/store'

import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'

const featureName = 'Block Detail'

export const loadBlock = createAction(`[${featureName}] Load Block`, props<{ id: string }>())
export const loadBlockSucceeded = createAction(`[${featureName}] Load Block Succeeded`, props<{ block: Block }>())
export const loadBlockFailed = createAction(`[${featureName}] Load Block Failed`, props<{ error: any }>())

// TODO: remove block argument when it'll be in store
export const loadTransactionsByKind = createAction(
  `[${featureName}] Load Transactions By Kind`,
  props<{ blockHash: string; kind: string }>()
)
export const loadTransactionsByKindSucceeded = createAction(
  `[${featureName}] Load Transactions By Kind Succeeded`,
  props<{ data: Transaction[] }>()
)
export const loadTransactionsByKindFailed = createAction(`[${featureName}] Load Transactions By Kind Failed`, props<{ error: any }>())

export const sortTransactionsByKind = createAction(
  `[${featureName}] Sort Transactions`,
  props<{ sortingValue: string; sortingDirection: string }>()
)

export const increasePageSize = createAction(`[${featureName}] Change Page Size`)

export const reset = createAction(`[${featureName}] Reset`)
