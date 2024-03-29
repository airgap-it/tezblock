import { createAction, props } from '@ngrx/store';

import { Transaction } from '@tezblock/interfaces/Transaction';
import { TokenContract } from '@tezblock/domain/contract';
import { ProposalDto } from '@tezblock/interfaces/proposal';
import { PeriodTimespan, DivisionOfVotes } from '@tezblock/domain/vote';
import { Block } from '@tezblock/interfaces/Block';
import { MarketDataSample } from '@tezblock/services/crypto-prices/crypto-prices.service';

const featureName = 'Dashboard';

export const loadContracts = createAction(`[${featureName}] Load Contracts`);
export const loadContractsSucceeded = createAction(
  `[${featureName}] Load Contracts Succeeded`,
  props<{ contracts: TokenContract[] }>()
);
export const loadContractsFailed = createAction(
  `[${featureName}] Load Contracts Failed`,
  props<{ error: any }>()
);

export const loadLatestProposal = createAction(
  `[${featureName}] Load Latest Proposal`
);
export const loadLatestProposalSucceeded = createAction(
  `[${featureName}] Load Latest Proposal Succeeded`,
  props<{ proposal: ProposalDto }>()
);
export const loadLatestProposalFailed = createAction(
  `[${featureName}] Load Latest Proposal Failed`,
  props<{ error: any }>()
);

export const loadCurrentPeriodTimespan = createAction(
  `[${featureName}] Load CurrenyPeriodTimespan`
);
export const loadCurrentPeriodTimespanSucceeded = createAction(
  `[${featureName}] Load CurrenyPeriodTimespan Succeeded`,
  props<{
    currentPeriodTimespan: PeriodTimespan;
    blocksPerVotingPeriod: number;
    timeBetweenBlocks: number;
  }>()
);
export const loadCurrentPeriodTimespanFailed = createAction(
  `[${featureName}] Load CurrenyPeriodTimespan Failed`,
  props<{ error: any }>()
);

export const loadTransactions = createAction(
  `[${featureName}] Load Transactions`
);
export const loadTransactionsSucceeded = createAction(
  `[${featureName}] Load Transactions Succeeded`,
  props<{ transactions: Transaction[] }>()
);
export const loadTransactionsFailed = createAction(
  `[${featureName}] Load Transactions Failed`,
  props<{ error: any }>()
);

export const loadBlocks = createAction(`[${featureName}] Load Blocks`);
export const loadBlocksSucceeded = createAction(
  `[${featureName}] Load Blocks Succeeded`,
  props<{ blocks: Block[] }>()
);
export const loadBlocksFailed = createAction(
  `[${featureName}] Load Blocks Failed`,
  props<{ error: any }>()
);

export const loadCryptoHistoricData = createAction(
  `[${featureName}] Load Crypto Historic Data`,
  props<{ periodIndex: number }>()
);
export const loadCryptoHistoricDataSucceeded = createAction(
  `[${featureName}] Load Crypto Historic Data Succeeded`,
  props<{ cryptoHistoricData: MarketDataSample[] }>()
);
export const loadCryptoHistoricDataFailed = createAction(
  `[${featureName}] Load Crypto Historic Data Failed`,
  props<{ error: any }>()
);

export const loadDivisionOfVotes = createAction(
  `[${featureName}] Load Division Of Votes`
);
export const loadDivisionOfVotesSucceeded = createAction(
  `[${featureName}] Load Division Of Votes Succeeded`,
  props<{ divisionOfVotes: DivisionOfVotes[] }>()
);
export const loadDivisionOfVotesFailed = createAction(
  `[${featureName}] Load Division Of Votes Failed`,
  props<{ error: any }>()
);

export const reset = createAction(`[${featureName}] Reset`);
