export interface BakingRights {
  priority: number
  estimated_time: number
  delegate: string
  block_hash: string
  level: number
  cycle: number
  rewards?: string
  deposit?: string
  fees?: string
}

export interface BakingRewardsDetail {
  level: number;
  amount: string;
  deposit: string;
  fees?: string;
}

export interface AggregatedBakingRights {
  cycle: number
  bakingsCount: number
  blockRewards: string
  deposits: string
  fees: number
  bakingRewardsDetails: BakingRewardsDetail[],
  rightStatus: string
}

export const getEmptyAggregatedBakingRight = (): AggregatedBakingRights => ({
  cycle: null,
  bakingsCount: 0,
  blockRewards: null,
  deposits: null,
  fees: 0,
  bakingRewardsDetails: [],
  rightStatus: undefined
})
