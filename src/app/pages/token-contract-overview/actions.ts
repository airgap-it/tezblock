import { createAction, props } from '@ngrx/store';
import { Pageable } from '@tezblock/domain/table';
import { TokenAsset } from '@tezblock/services/contract/contract.service';

const featureName = 'Token Contract Overview';

export const loadTokenAssets = createAction(
  `[${featureName}] Load Token Assets`
);
export const loadTokenAssetsSucceeded = createAction(
  `[${featureName}] Load Token Assets Succeeded`,
  props<{ tokenAssets: Pageable<TokenAsset> }>()
);
export const loadTokenContractsFailed = createAction(
  `[${featureName}] Load Token Assets Failed`,
  props<{ error: any }>()
);
export const increasePageOfTokenContracts = createAction(
  `[${featureName}] Increase Page Of Token Assets`
);

export const reset = createAction(`[${featureName}] Reset`);
