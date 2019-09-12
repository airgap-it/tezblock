export interface BakingBadResponse {
  address?: string
  balance?: number
  config?: {
    address: string
    fee: number
    minBalance: number
    minPayout: number
    payoutDelay: number
    payoutFee: number
    payoutPeriod: number
    payoutRatio: number
    rewardStruct: number
  }
  estimatedRoi?: number
  logo?: string
  name?: string
  rating?: {
    actualRoi: number
    address: string
    avgRolls: number
    delegator: string
    fromCycle: number
    prevRoi: number
    sharedConfig: string
    status: number
    toCycle: number
  }
  site?: string
  stakingBalance?: number
  stakingCapacity?: number
}
