import { createAction, props } from '@ngrx/store';
import { Account } from '@tezblock/domain/account';
import { OrderBy } from '@tezblock/services/base.service';

const featureName = 'New Accounts';

export const loadAccounts = createAction(`[${featureName}] Load Accounts`);
export const loadAccountsSucceeded = createAction(
  `[${featureName}] Load Accounts Succeeded`,
  props<{ accounts: Account[] }>()
);
export const loadAccountsFailed = createAction(
  `[${featureName}] Load Accounts Failed`,
  props<{ error: any }>()
);
export const increasePageOfAccounts = createAction(
  `[${featureName}] Increase Page Of Accounts`
);
export const sortAccounts = createAction(
  `[${featureName}] Sort Accounts`,
  props<{ orderBy: OrderBy }>()
);

export const loadTop25Accounts = createAction(
  `[${featureName}] Load Top 25 Accounts`
);
export const loadTop25AccountsSucceeded = createAction(
  `[${featureName}] Load Top 25 Accounts Succeeded`,
  props<{ top25Accounts: Account[] }>()
);
export const loadTop25AccountsFailed = createAction(
  `[${featureName}] Load Top 25 Accounts Failed`,
  props<{ error: any }>()
);

export const reset = createAction(`[${featureName}] Reset`);
