import { createAction, props } from '@ngrx/store';

import { Transaction } from '@tezblock/interfaces/Transaction';

const featureName = 'Endorsement Details';

export const reset = createAction(
  `[${featureName}] Reset`,
  props<{ id: string }>()
);

export const loadEndorsements = createAction(
  `[${featureName}] Load Endorsements`
);
export const loadEndorsementsSucceeded = createAction(
  `[${featureName}] Load Endorsements Succeeded`,
  props<{ endorsements: Transaction[] }>()
);
export const loadEndorsementsFailed = createAction(
  `[${featureName}] Load Endorsements Failed`,
  props<{ error: any }>()
);

export const loadEndorsementDetails = createAction(
  `[${featureName}] Load Endorsement Details`,
  props<{ id: string }>()
);
export const loadEndorsementDetailsSucceeded = createAction(
  `[${featureName}] Load Endorsement Details Succeeded`,
  props<{ endorsement: Transaction }>()
);
export const loadEndorsementDetailsFailed = createAction(
  `[${featureName}] Load Endorsement Details Failed`,
  props<{ error: any }>()
);

export const slotSelected = createAction(
  `[${featureName}] Slot Selected`,
  props<{ operation_group_hash: string }>()
);
