export interface BakingBadResponse {
  address?: string;
  balance?: number;
  config?: Config;
  estimatedRoi?: number;
  logo?: string;
  name?: string;
  site?: string;
  stakingBalance?: number;
  stakingCapacity?: number;
  status?: string;
  payoutAccuracy: string;
}

export interface Config {
  address: string;
  fee: FeeByCycle[];
  minDelegation: number;
  minPayout: number;
  payoutDelay: number;
  payoutFee: number;
  payoutPeriod: number;
  payoutRatio: number;
  rewardStruct: number;
}

export interface FeeByCycle {
  cycle: number;
  value: number;
}
