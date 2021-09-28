import { createAction, props } from '@ngrx/store';
import { NavigationEnd } from '@angular/router';
import BigNumber from 'bignumber.js';

import { Block } from '@tezblock/interfaces/Block';
import { ProtocolConstantResponse } from '@tezblock/services/protocol-variables/protocol-variables.service';

const featureName = 'App';

export const saveLatestRoute = createAction(
  `[${featureName}] Save Latest Route`,
  props<{ navigation: NavigationEnd }>()
);

export const loadLatestBlock = createAction(
  `[${featureName}] Load LatestBlock`
);
export const loadLatestBlockSucceeded = createAction(
  `[${featureName}] Load LatestBlock Succeeded`,
  props<{ latestBlock: Block }>()
);
export const loadLatestBlockFailed = createAction(
  `[${featureName}] Load LatestBlock Failed`,
  props<{ error: any }>()
);

export const loadFirstBlockOfCycle = createAction(
  `[${featureName}] Load First Block Of Cycle`,
  props<{ cycle: number }>()
);
export const loadFirstBlockOfCycleSucceeded = createAction(
  `[${featureName}] Load First Block Of Cycle Succeeded`,
  props<{ firstBlockOfCycle: Block }>()
);
export const loadFirstBlockOfCycleFailed = createAction(
  `[${featureName}] Load First Block Of Cycle Failed`,
  props<{ error: any }>()
);

export const loadPeriodInfos = createAction(
  `[${featureName}] Load Period Infos`
);
export const loadPeriodInfosSucceeded = createAction(
  `[${featureName}] Load Period Infos Succeeded`,
  props<{
    currentVotingPeriod: number;
    currentVotingeriodPosition: number;
    blocksPerVotingPeriod: number;
  }>()
);
export const loadPeriodInfosFailed = createAction(
  `[${featureName}] Load Period Infos Failed`,
  props<{ error: any }>()
);

export const loadCryptoPriceFromCache = createAction(
  `[${featureName}] Load Crypto Price From Cache`
);
export const loadCryptoPriceFromCacheSucceeded = createAction(
  `[${featureName}] Load Crypto Price From Cache Succeeded`,
  props<{ fiatPrice: BigNumber; cryptoPrice: BigNumber }>()
);
export const loadCryptoPriceFromCacheFailed = createAction(
  `[${featureName}] Load Crypto Price From Cache Failed`,
  props<{ error: any }>()
);

export const loadCryptoPrice = createAction(
  `[${featureName}] Load Crypto Price`
);
export const loadCryptoPriceSucceeded = createAction(
  `[${featureName}] Load Crypto Price Succeeded`,
  props<{ fiatPrice: BigNumber; cryptoPrice: BigNumber }>()
);
export const loadCryptoPriceFailed = createAction(
  `[${featureName}] Load Crypto Price Failed`,
  props<{ error: any }>()
);

export const loadExchangeRate = createAction(
  `[${featureName}] Load Exchange Rate`,
  props<{ from: string; to: string }>()
);
export const loadExchangeRateSucceeded = createAction(
  `[${featureName}] Load Exchange Rate Succeeded`,
  props<{ from: string; to: string; price: number }>()
);
export const loadExchangeRateFailed = createAction(
  `[${featureName}] Load Exchange Rate Failed`,
  props<{ error: any }>()
);

export const loadProtocolVariables = createAction(
  `[${featureName}] Load Protocol Variables`
);
export const loadProtocolVariablesSucceeded = createAction(
  `[${featureName}] Load Protocol Variables Succeeded`,
  props<{ protocolVariables: ProtocolConstantResponse }>()
);
export const loadProtocolVariablesFailed = createAction(
  `[${featureName}] Load Protocol Variables Failed`,
  props<{ error: any }>()
);
