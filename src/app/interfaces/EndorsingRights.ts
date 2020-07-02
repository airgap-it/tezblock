export interface EndorsingRights {
  estimated_time: number
  delegate: string
  block_hash: string
  slot: number
  level: number
  cycle: number
  rewards?: string
  deposit?: string
}

export interface EndorsingRewardsDetail {
  level: number
  amount: string
  deposit: string
}

export interface AggregatedEndorsingRights {
  cycle: number
  endorsementsCount: number
  endorsementRewards: string
  deposits: string
  endorsingRewardsDetails: EndorsingRewardsDetail[]
  rightStatus: string
}

export const getEmptyAggregatedEndorsingRight = (): AggregatedEndorsingRights => ({
  cycle: null,
  endorsementsCount: 0,
  endorsementRewards: null,
  deposits: null,
  endorsingRewardsDetails: undefined,
  rightStatus: undefined
})
