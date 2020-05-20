import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { TranslateService } from '@ngx-translate/core'

export const columns: { [key: string]: (options: { showFiatValue: boolean; translate?: any }) => Column[] } = {
  [OperationTypes.BakingRights]: (options?: { showFiatValue?: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('baker-table.baking-rights.cycle'),
      field: 'cycle',
      template: Template.basic
    },
    {
      name: options.translate.instant('baker-table.baking-rights.number-of-bakings'),
      field: 'bakingsCount',
      template: Template.basic
    },
    {
      name: options.translate.instant('baker-table.baking-rights.block-rewards'),
      field: 'blockRewards',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: { amount: item.blockRewards }, options })
    },
    {
      name: options.translate.instant('baker-table.baking-rights.deposits'),
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: { amount: item.deposits }, options })
    },
    {
      name: options.translate.instant('baker-table.baking-rights.fees'),
      field: 'fees',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: { amount: item.fees }, options })
    }
  ],

  [OperationTypes.EndorsingRights]: (options?: { showFiatValue?: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('baker-table.endorsing-rights.cycle'),
      field: 'cycle',
      template: Template.basic
    },
    {
      name: options.translate.instant('baker-table.endorsing-rights.number-of-endorsements'),
      field: 'endorsementsCount',
      template: Template.basic
    },
    {
      name: options.translate.instant('baker-table.endorsing-rights.endorsement-rewards'),
      field: 'endorsementRewards',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: { amount: item.endorsementRewards }, options })
    },
    {
      name: options.translate.instant('baker-table.endorsing-rights.deposits'),
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: { amount: item.deposits }, options })
    }
  ],

  [OperationTypes.Rewards]: (options?: { showFiatValue?: boolean; translate?: TranslateService }) => [
    {
      name: options.translate.instant('baker-table.rewards.cycle'),
      field: 'cycle',
      template: Template.basic
    },
    {
      name: options.translate.instant('baker-table.rewards.delegations'),
      field: 'delegatedContracts',
      data: (item: TezosRewards) => ({ data: Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null }),
      template: Template.basic
    },
    {
      name: options.translate.instant('baker-table.rewards.staking-balance'),
      field: 'stakingBalance',
      data: (item: TezosRewards) => ({ data: { amount: item.stakingBalance }, options }),
      template: Template.amount
    },
    {
      name: options.translate.instant('baker-table.rewards.block-rewards'),
      field: 'bakingRewards',
      data: (item: TezosRewards) => ({ data: { amount: item.bakingRewards }, options }),
      template: Template.amount
    },
    {
      name: options.translate.instant('baker-table.rewards.endorsement-rewards'),
      field: 'endorsingRewards',
      data: (item: TezosRewards) => ({ data: { amount: item.endorsingRewards }, options }),
      template: Template.amount
    },
    {
      name: options.translate.instant('baker-table.rewards.fees'),
      field: 'fees',
      data: (item: TezosRewards) => ({ data: { amount: item.fees }, options: { showFiatValue: false } }),
      template: Template.amount
    }
  ]
}
