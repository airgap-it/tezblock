// TODO: probalby this file is not needed
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

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
