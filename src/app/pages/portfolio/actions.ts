import { createAction, props } from '@ngrx/store';
import { Transaction } from '@tezblock/interfaces/Transaction';
import { Account } from '@tezblock/domain/account';
import { Balance } from '@tezblock/services/api/api.service';
import { Count } from '@tezblock/domain/tab';
import { OrderBy } from '@tezblock/services/base.service';
import { OperationErrorsById } from '@tezblock/domain/operations';
import { ContractAsset } from '@tezblock/domain/contract';

const featureName = 'Portfolio';

export const loadTransactionsByKind = createAction(
  `[${featureName}] Load Transactions By Kind`,
  props<{ kind: string; orderBy?: OrderBy }>()
);
export const loadTransactionsByKindSucceeded = createAction(
  `[${featureName}] Load Transactions By Kind Succeeded`,
  props<{ data: Transaction[] }>()
);
export const loadTransactionsByKindFailed = createAction(
  `[${featureName}] Load Transactions By Kind Failed`,
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

export const loadAccount = createAction(
  `[${featureName}] Load Account`,
  props<{ address: string }>()
);
export const loadAccountSucceeded = createAction(
  `[${featureName}] Load Account Succeeded`,
  props<{ account: Account }>()
);
export const loadAccountFailed = createAction(
  `[${featureName}] Load Account Failed`,
  props<{ error: any }>()
);

export const loadCollectibles = createAction(
  `[${featureName}] Load Collectibles`
);
export const loadCollectiblesSucceeded = createAction(
  `[${featureName}] Load Collectibles Succeeded`,
  props<{ data: any }>()
);
export const loadCollectiblesFailed = createAction(
  `[${featureName}] Load Collectibles Failed`,
  props<{ error: any }>()
);

export const loadCollectiblesCount = createAction(
  `[${featureName}] Load Collectibles Count`
);
export const loadCollectiblesCountSucceeded = createAction(
  `[${featureName}] Load Collectibles Count Succeeded`,
  props<{ data: number }>()
);
export const loadCollectiblesCountFailed = createAction(
  `[${featureName}] Load Collectibles Count Failed`,
  props<{ error: any }>()
);

export const loadBalanceForLast30Days = createAction(
  `[${featureName}] Load Balance For Last 30 Days`,
  props<{ address: string }>()
);
export const loadBalanceForLast30DaysSucceeded = createAction(
  `[${featureName}] Load Balance For Last 30 Days Succeeded`,
  props<{ balanceFromLast30Days: Balance[] }>()
);
export const loadBalanceForLast30DaysFailed = createAction(
  `[${featureName}] Load Balance For Last 30 Days Failed`,
  props<{ error: any }>()
);

export const sortTransactionsByKind = createAction(
  `[${featureName}] Sort Transactions`,
  props<{ orderBy: OrderBy }>()
);

export const increasePageSize = createAction(
  `[${featureName}] Change Page Size`
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

export const loadContractAssets = createAction(
  `[${featureName}] Load Contract Assets`
);
export const loadContractAssetsSucceeded = createAction(
  `[${featureName}] Load Contract Assets Succeeded`,
  props<{ data: ContractAsset[] }>()
);
export const loadContractAssetsFailed = createAction(
  `[${featureName}] Load Contract Assets Failed`,
  props<{ error: any }>()
);

export const wrapAssetsWithTez = createAction(
  `[${featureName}] Wrap Assets With Tez`
);
export const wrapAssetsWithTezSucceeded = createAction(
  `[${featureName}] Wrap Assets With Tez Succeeded`,
  props<{ data: ContractAsset[] }>()
);
export const wrapAssetsWithTezFailed = createAction(
  `[${featureName}] Wrap Assets With Tez Failed`,
  props<{ error: any }>()
);

export const loadPortfolioValue = createAction(
  `[${featureName}] Load Portfolio Value Assets`
);
export const loadPortfolioValueSucceeded = createAction(
  `[${featureName}] Load Portfolio Value Succeeded`,
  props<{ data: string }>()
);
export const loadPortfolioValueFailed = createAction(
  `[${featureName}] Load Portfolio Value Failed`,
  props<{ error: any }>()
);

export const setKind = createAction(
  `[${featureName}] Set Kind`,
  props<{ kind: string }>()
);

export const reset = createAction(`[${featureName}] Reset`);
