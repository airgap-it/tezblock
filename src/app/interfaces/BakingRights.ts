export interface BakingRights {
  priority: number
  estimated_time: number
  delegate: string
  block_hash: string
  level: number
  cycle: number
}

export interface AggregatedBakingRights {
  cycle: number
  bakingsCount: number
  blockRewards: number // ?
  deposits: number // ?
  fees: number // ?
  items: BakingRights[]
}
