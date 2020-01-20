import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table2/tezblock-table2.component'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'

export const columns: { [key: string]: () => Column[] } = {
  [OperationTypes.BakingRights]: () => [
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
      data: (item: AggregatedBakingRights) => ({ data: item.blockRewards, options: { showFiatValue: true } })
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.deposits, options: { showFiatValue: true } })
    },
    {
      name: 'Fees',
      field: 'fees',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.fees, options: { showFiatValue: true } })
    }
  ],

  [OperationTypes.EndorsingRights]: () => [
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
      data: (item: AggregatedEndorsingRights) => ({ data: item.endorsementRewards, options: { showFiatValue: true } })
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: item.deposits, options: { showFiatValue: true } })
    }
  ],

  [OperationTypes.Rewards]: () => [
    {
        name: 'Cycle',
        field: 'cycle',
        template: Template.basic
      },
      {
        name: 'Delegations',
        field: 'delegatedContracts',
        data: (item: TezosRewards) => (Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null),
        template: Template.basic
      },
      {
        name: 'Staking Balance',
        field: 'stakingBalance',
        data: (item: TezosRewards) => ({ data: item.stakingBalance, options: { showFiatValue: true } }),
        template: Template.amount
      },
      {
        name: 'Block Rewards',
        field: 'bakingRewards',
        data: (item: TezosRewards) => ({ data: item.bakingRewards, options: { showFiatValue: true } }),
        template: Template.amount
      },
      {
        name: 'Endorsement Rewards',
        field: 'endorsingRewards',
        data: (item: TezosRewards) => ({ data: item.endorsingRewards, options: { showFiatValue: true } }),
        template: Template.amount
      },
      {
        name: 'Fees',
        field: 'fees',
        data: (item: TezosRewards) => ({ data: item.fees, options: { showFiatValue: false } }),
        template: Template.amount
      }
  ]
}
