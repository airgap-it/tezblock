import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { TranslateService } from '@ngx-translate/core'
import { ExtendedTezosRewards } from '@tezblock/services/reward/reward.service'

export const columns: { [key: string]: (options: { showFiatValue: boolean }, translateService?: TranslateService) => Column[] } = {
  [OperationTypes.BakingRights]: (options?: { showFiatValue?: boolean }, translateService?: TranslateService) => [
    {
      name: translateService.instant('baker-table.baking-rights.status'),
      field: 'rightStatus',
      data: (item: AggregatedBakingRights) => ({
        data: item.rightStatus,
        options: item.rightStatus === 'Active' ? { cssClass: 'text-primary' } : undefined
      })
    },
    {
      name: translateService.instant('baker-table.baking-rights.cycle'),
      field: 'cycle',
      template: Template.basic
    },
    {
      name: translateService.instant('baker-table.baking-rights.number-of-bakings'),
      field: 'bakingsCount',
      template: Template.basic
    },
    {
      name: translateService.instant('baker-table.baking-rights.block-rewards'),
      field: 'blockRewards',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.blockRewards, options })
    },
    {
      name: translateService.instant('baker-table.baking-rights.deposits'),
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.deposits, options })
    },
    {
      name: translateService.instant('baker-table.baking-rights.fees'),
      field: 'fees',
      template: Template.amount,
      data: (item: AggregatedBakingRights) => ({ data: item.fees, options })
    }
  ],

  [OperationTypes.EndorsingRights]: (options?: { showFiatValue?: boolean }, translateService?: TranslateService) => [
    {
      name: translateService.instant('baker-table.endorsing-rights.status'),
      field: 'rightStatus',
      data: (item: AggregatedEndorsingRights) => ({
        data: item.rightStatus,
        options: item.rightStatus === 'Active' ? { cssClass: 'text-primary' } : undefined
      })
    },

    {
      name: translateService.instant('baker-table.endorsing-rights.cycle'),
      field: 'cycle',
      template: Template.basic
    },
    {
      name: translateService.instant('baker-table.endorsing-rights.number-of-endorsements'),
      field: 'endorsementsCount',
      template: Template.basic
    },
    {
      name: translateService.instant('baker-table.endorsing-rights.endorsement-rewards'),
      field: 'endorsementRewards',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: item.endorsementRewards, options })
    },
    {
      name: translateService.instant('baker-table.endorsing-rights.deposits'),
      field: 'deposits',
      template: Template.amount,
      data: (item: AggregatedEndorsingRights) => ({ data: item.deposits, options })
    }
  ],

  [OperationTypes.Rewards]: (options?: { showFiatValue?: boolean }, translateService?: TranslateService) => [
    {
      name: translateService.instant('baker-table.rewards.status'),
      field: 'rightStatus',
      data: (item: ExtendedTezosRewards) => ({
        data: item.rightStatus,
        options: item.rightStatus === 'Active' ? { cssClass: 'text-primary' } : undefined
      })
    },
    {
      name: translateService.instant('baker-table.rewards.cycle'),
      field: 'cycle',
      template: Template.basic
    },
    {
      name: translateService.instant('baker-table.rewards.delegations'),
      field: 'delegatedContracts',
      data: (item: ExtendedTezosRewards) => ({ data: Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null }),
      template: Template.basic
    },
    {
      name: translateService.instant('baker-table.rewards.staking-balance'),
      field: 'stakingBalance',
      data: (item: ExtendedTezosRewards) => ({ data: item.stakingBalance, options }),
      template: Template.amount
    },
    {
      name: translateService.instant('baker-table.rewards.block-rewards'),
      field: 'bakingRewards',
      data: (item: ExtendedTezosRewards) => ({ data: item.bakingRewards, options }),
      template: Template.amount
    },
    {
      name: translateService.instant('baker-table.rewards.endorsement-rewards'),
      field: 'endorsingRewards',
      data: (item: ExtendedTezosRewards) => ({ data: item.endorsingRewards, options }),
      template: Template.amount
    },
    {
      name: translateService.instant('baker-table.rewards.fees'),
      field: 'fees',
      data: (item: ExtendedTezosRewards) => ({ data: item.fees, options: { showFiatValue: false } }),
      template: Template.amount
    }
  ]
}
