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

export interface AggregatedEndorsingRights {
  cycle: number
  endorsementsCount: number
  endorsementRewards: string
  deposits: string
  items: EndorsingRights[]
}

export const getEmptyAggregatedEndorsingRight = () => ({
  cycle: null,
  endorsementsCount: 0,
  endorsementRewards: null,
  deposits: null,
  items: []
})
