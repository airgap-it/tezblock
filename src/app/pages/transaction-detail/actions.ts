import { createAction, props } from '@ngrx/store';

import { Transaction } from '@tezblock/interfaces/Transaction';
import { Block } from '@tezblock/interfaces/Block';
import { Count } from '@tezblock/domain/tab';
import { OrderBy } from '@tezblock/services/base.service';
import { OperationErrorsById } from '@tezblock/domain/operations';

const featureName = 'Transaction Detail';

export const loadTransactionsByHash = createAction(
  `[${featureName}] Load Transactions By Hash`,
  props<{ transactionHash: string }>()
);
export const loadTransactionsByHashSucceeded = createAction(
  `[${featureName}] Load Transactions By Hash Succeeded`,
  props<{ data: Transaction[] }>()
);
export const loadTransactionsByHashFailed = createAction(
  `[${featureName}] Load Transactions By Hash Failed`,
  props<{ error: any }>()
);

export const loadTransactionsCounts = createAction(
  `[${featureName}] Load Transactions Counts`
);
export const loadTransactionsCountsSucceeded = createAction(
  `[${featureName}] Load Transactions Counts Succeeded`,
  props<{ counts: Count[] }>()
);
export const loadTransactionsCountsFailed = createAction(
  `[${featureName}] Load Transactions Counts Failed`,
  props<{ error: any }>()
);

export const loadLatestBlock = createAction(
  `[${featureName}] Load Latest Block`
);
export const loadLatestBlockSucceeded = createAction(
  `[${featureName}] Load Latest Block Succeeded`,
  props<{ latestBlock: Block }>()
);
export const loadLatestBlockFailed = createAction(
  `[${featureName}] Load Latest Block Failed`,
  props<{ error: any }>()
);

export const sortTransactionsByKind = createAction(
  `[${featureName}] Sort Transactions`,
  props<{ orderBy: OrderBy }>()
);

export const increasePageSize = createAction(
  `[${featureName}] Change Page Size`
);

export const loadTransactionsTotalAmount = createAction(
  `[${featureName}] Load Transactions Total Amount`
);
export const loadTransactionsTotalAmountSucceeded = createAction(
  `[${featureName}] Load Transactions Total Amount Succeeded`,
  props<{ totalAmount: number }>()
);
export const loadTransactionsTotalAmountFailed = createAction(
  `[${featureName}] Load Transactions Total Amount Failed`,
  props<{ error: any }>()
);

export const loadTransactionsTotalFee = createAction(
  `[${featureName}] Load Transactions Total Fee`
);
export const loadTransactionsTotalFeeSucceeded = createAction(
  `[${featureName}] Load Transactions Total Fee Succeeded`,
  props<{ totalFee: number }>()
);
export const loadTransactionsTotalFeeFailed = createAction(
  `[${featureName}] Load Transactions Total Fee Failed`,
  props<{ error: any }>()
);

export const loadTransactionsErrors = createAction(
  `[${featureName}] Load Transactions Errors`,
  props<{ transactions: Transaction[] }>()
);
export const loadTransactionsErrorsSucceeded = createAction(
  `[${featureName}] Load Transactions Errors Succeeded`,
  props<{ operationErrorsById: OperationErrorsById[] }>()
);
export const loadTransactionsErrorsFailed = createAction(
  `[${featureName}] Load Transactions Errors Failed`,
  props<{ error: any }>()
);

export const changeKind = createAction(
  `[${featureName}] Change kind`,
  props<{ kind: string }>()
);

export const reset = createAction(`[${featureName}] Reset`);
