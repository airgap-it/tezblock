import { TokenContract } from '@tezblock/domain/contract';

export interface BakingRatingResponse {
  bakingRating: string;
  tezosBakerFee: number;
  stakingCapacity?: number;
}

export interface ContractAsset {
  contract: TokenContract;
  amount: number;
}
