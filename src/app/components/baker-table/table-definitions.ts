import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'

export const columns: { [key: string]: (options: { showFiatValue: boolean }) => Column[] } = {
  [OperationTypes.BakingRights]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Cycle',
      field: 'cycle',
      template: Template.basic
    },
    {
      name: '# of Bakings',
      field: 'bakingsCount',
      template: Template.basic
    },
    {
      name: 'Block Rewards',
      field: 'blockRewards',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: { amount: item.blockRewards }, options })
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: { amount: item.deposits }, options })
    },
    {
      name: 'Fees',
      field: 'fees',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: { amount: item.fees }, options })
    }
  ],

  [OperationTypes.EndorsingRights]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Cycle',
      field: 'cycle',
      template: Template.basic
    },
    {
      name: '# of Endorsements',
      field: 'endorsementsCount',
      template: Template.basic
    },
    {
      name: 'Endorsement Rewards',
      field: 'endorsementRewards',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: { amount: item.endorsementRewards }, options })
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: { amount: item.deposits }, options })
    }
  ],

  [OperationTypes.Rewards]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Cycle',
      field: 'cycle',
      template: Template.basic
    },
    {
      name: 'Delegations',
      field: 'delegatedContracts',
      data: (item: TezosRewards) => ({ data: Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null }),
      template: Template.basic
    },
    {
      name: 'Staking Balance',
      field: 'stakingBalance',
      data: (item: TezosRewards) => ({ data: { amount: item.stakingBalance }, options }),
      template: Template.amount
    },
    {
      name: 'Block Rewards',
      field: 'bakingRewards',
      data: (item: TezosRewards) => ({ data: { amount: item.bakingRewards }, options }),
      template: Template.amount
    },
    {
      name: 'Endorsement Rewards',
      field: 'endorsingRewards',
      data: (item: TezosRewards) => ({ data: { amount: item.endorsingRewards }, options }),
      template: Template.amount
    },
    {
      name: 'Fees',
      field: 'fees',
      data: (item: TezosRewards) => ({ data: { amount: item.fees }, options: { showFiatValue: false } }),
      template: Template.amount
    }
  ]
}
