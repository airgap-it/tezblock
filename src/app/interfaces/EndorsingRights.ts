export interface EndorsingRights {
  estimated_time: number
  delegate: string
  block_hash: string
  slot: number
  level: number
  cycle: number
  rewards?: string
}

export interface AggregatedEndorsingRights {
  cycle: number
  endorsementsCount: number
  endorsementRewards: string
  deposits: number // ?
  items: EndorsingRights[]
}
