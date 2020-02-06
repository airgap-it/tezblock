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
      template: Template.basic,
      sortable: false
    },
    {
      name: '# of Bakings',
      field: 'bakingsCount',
      template: Template.basic,
      sortable: false
    },
    {
      name: 'Block Rewards',
      field: 'blockRewards',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.blockRewards, options }),
      sortable: false
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.deposits, options }),
      sortable: false
    },
    {
      name: 'Fees',
      field: 'fees',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.fees, options }),
      sortable: false
    }
  ],

  [OperationTypes.EndorsingRights]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Cycle',
      field: 'cycle',
      template: Template.basic,
      sortable: false
    },
    {
      name: '# of Endorsements',
      field: 'endorsementsCount',
      template: Template.basic,
      sortable: false
    },
    {
      name: 'Endorsement Rewards',
      field: 'endorsementRewards',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: item.endorsementRewards, options }),
      sortable: false
    },
    {
      name: 'Deposits',
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: item.deposits, options }),
      sortable: false
    }
  ],

  [OperationTypes.Rewards]: (options?: { showFiatValue?: boolean }) => [
    {
      name: 'Cycle',
      field: 'cycle',
      template: Template.basic,
      sortable: false
    },
    {
      name: 'Delegations',
      field: 'delegatedContracts',
      data: (item: TezosRewards) => ({ data: Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null }),
      template: Template.basic,
      sortable: false
    },
    {
      name: 'Staking Balance',
      field: 'stakingBalance',
      data: (item: TezosRewards) => ({ data: item.stakingBalance, options }),
      template: Template.amount,
      sortable: false
    },
    {
      name: 'Block Rewards',
      field: 'bakingRewards',
      data: (item: TezosRewards) => ({ data: item.bakingRewards, options }),
      template: Template.amount,
      sortable: false
    },
    {
      name: 'Endorsement Rewards',
      field: 'endorsingRewards',
      data: (item: TezosRewards) => ({ data: item.endorsingRewards, options }),
      template: Template.amount,
      sortable: false
    },
    {
      name: 'Fees',
      field: 'fees',
      data: (item: TezosRewards) => ({ data: item.fees, options: { showFiatValue: false } }),
      template: Template.amount,
      sortable: false
    }
  ]
}
