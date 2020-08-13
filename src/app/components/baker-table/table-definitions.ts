import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { ExtendedTezosRewards } from '@tezblock/services/reward/reward.service'

export const columns: { [key: string]: (options: { showFiatValue: boolean }) => Column[] } = {
  [OperationTypes.BakingRights]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Status',
      field: 'rightStatus',
      data: (item: AggregatedBakingRights) => ({
        data: item.rightStatus,
        options: item.rightStatus === 'Active' ? { cssClass: 'text-primary' } : undefined
      })
    },
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
      data: (item: AggregatedBakingRights) => ({ data: item.blockRewards, options })
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.deposits, options })
    },
    {
      name: 'Fees',
      field: 'fees',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.fees, options })
    }
  ],

  [OperationTypes.EndorsingRights]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Status',
      field: 'rightStatus',
      data: (item: AggregatedEndorsingRights) => ({
        data: item.rightStatus,
        options: item.rightStatus === 'Active' ? { cssClass: 'text-primary' } : undefined
      })
    },
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
      data: (item: AggregatedEndorsingRights) => ({ data: item.endorsementRewards, options })
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: item.deposits, options })
    }
  ],

  [OperationTypes.Rewards]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Status',
      field: 'rightStatus',
      data: (item: ExtendedTezosRewards) => ({
        data: item.rightStatus,
        options: item.rightStatus === 'Active' ? { cssClass: 'text-primary' } : undefined
      })
    },
    {
      name: 'Cycle',
      field: 'cycle',
      template: Template.basic
    },
    {
      name: 'Delegations',
      field: 'delegatedContracts',
      data: (item: ExtendedTezosRewards) => ({ data: Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null }),
      template: Template.basic
    },
    {
      name: 'Staking Balance',
      field: 'stakingBalance',
      data: (item: ExtendedTezosRewards) => ({ data: item.stakingBalance, options }),
      template: Template.amount
    },
    {
      name: 'Block Rewards',
      field: 'bakingRewards',
      data: (item: ExtendedTezosRewards) => ({ data: item.bakingRewards, options }),
      template: Template.amount
    },
    {
      name: 'Endorsement Rewards',
      field: 'endorsingRewards',
      data: (item: ExtendedTezosRewards) => ({ data: item.endorsingRewards, options }),
      template: Template.amount
    },
    {
      name: 'Fees',
      field: 'fees',
      data: (item: ExtendedTezosRewards) => ({ data: item.fees, options: { showFiatValue: false } }),
      template: Template.amount
    }
  ]
}
