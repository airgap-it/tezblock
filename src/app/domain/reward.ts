import { TezosRewards } from "@airgap/coinlib-core/protocols/tezos/TezosProtocol"

export interface Payout {
  delegator: string
  share: string
  payout: string
}

export interface Reward extends TezosRewards {
  payouts: Payout[]
}

export const getRewardAmountMinusFee = (rewardAmont: number, tezosBakerFee: number): number =>
  rewardAmont - rewardAmont * (tezosBakerFee / 100)

/*
    next 5 cycles: Upcoming
    current cycle: Active
    past 5 cycles: Frozen
    past 5 cycles + : Unfrozen
*/
export const getRightStatus = (currentCycle: number, cycle: number): string => {
  if (cycle > currentCycle) {
    return 'Upcoming'
  }

  if (cycle === currentCycle) {
    return 'Active'
  }

  if (cycle < currentCycle - 5) {
    return 'Unfrozen'
  }

  return 'Frozen'
}
