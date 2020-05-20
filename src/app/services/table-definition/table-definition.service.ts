import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { AggregatedBakingRights } from '@tezblock/interfaces/BakingRights'
import { AggregatedEndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Options } from '@tezblock/components/address-item/address-item.component'

@Injectable({
  providedIn: 'root'
})
export class TableDefinitionService {
  blockColumns: { [key: string]: (options: { pageId: string; showFiatValue: boolean }) => Column[] } = {
    [OperationTypes.Transaction]: (options: { pageId: string; showFiatValue: boolean }) => [
      {
        name: this.translateService.instant('tezblock-table.transaction.from'),
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.transaction.to'),
        field: 'destination',
        width: '1',
        data: (item: Transaction) => ({ data: item.destination, options: { showFullAddress: false, pageId: options.pageId } }),
        template: Template.address,
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.transaction.amount'),
        field: 'amount',
        data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options }),
        template: Template.amount,
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.transaction.fee'),
        field: 'fee',
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: true } }),
        template: Template.amount,
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.transaction.gas-limit'),
        field: 'gas_limit',
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.transaction.tx-hash'),
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: any) => ({ data: item.operation_group_hash }),
        sortable: false
      }
    ],

    [OperationTypes.Delegation]: (options: { pageId: string; showFiatValue: boolean }) => [
      {
        name: this.translateService.instant('tezblock-table.delegation.delegator'),
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.delegation.baker'),
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, pageId: options.pageId, isText: !item.delegate ? true : undefined }
        }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.delegation.amount'),
        field: 'delegatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.delegatedBalance, timestamp: item.timestamp }, options }),
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.delegation.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: true } }),
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.delegation.gas-limit'),
        field: 'gas_limit',
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.delegation.tx-hash'),
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: any) => ({ data: item.operation_group_hash }),
        sortable: false
      }
    ],

    [OperationTypes.Origination]: (options: { pageId: string; showFiatValue: boolean }) => [
      {
        name: this.translateService.instant('tezblock-table.origination.new-account'),
        field: 'originated_contracts',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.origination.balance'),
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options }),
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.origination.originator'),
        field: 'source',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.origination.baker'),
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.origination.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: true } }),
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.origination.burn'),
        field: 'burn',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.burn }, options: { showFiatValue: false } }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.origination.gas-limit'),
        field: 'gas_limit',
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.origination.tx-hash'),
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: any) => ({ data: item.operation_group_hash }),
        sortable: false
      }
    ],

    [OperationTypes.Endorsement]: (options: { pageId: string; showFiatValue: boolean }) => [
      {
        name: this.translateService.instant('tezblock-table.endorsement.endorser'),
        field: 'delegate',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.slots'),
        field: 'slots',
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.tx-hash'),
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } }),
        sortable: false
      }
    ],

    [OperationTypes.Activation]: (options: { pageId: string; showFiatValue: boolean }) => [
      {
        name: this.translateService.instant('tezblock-table.activation.account'),
        field: 'pkh',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true, pageId: options.pageId } }),
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.activation.secret'),
        field: 'secret',
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.activation.tx-hash'),
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.operation_group_hash }),
        sortable: false
      }
    ]
  }

  accountColumns: { [key: string]: (options: Options) => Column[] } = {
    [OperationTypes.Transaction]: (options: Options) =>
      [
        {
          name: this.translateService.instant('tezblock-table.transaction.from'),
          field: 'source',
          width: '1',
          template: Template.address,
          data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
        },
        {
          field: 'applied',
          width: '1',
          template: Template.symbol,
          data: (item: Transaction) => ({ data: item.outgoing })
        },
        {
          name: this.translateService.instant('tezblock-table.transaction.to'),
          field: 'destination',
          width: '1',
          data: (item: Transaction) => ({ data: item.destination, options: { showFullAddress: false, pageId: options.pageId } }),
          template: Template.address
        },
        {
          name: this.translateService.instant('tezblock-table.transaction.age'),
          field: 'timestamp',
          template: Template.timestamp,
          sortable: true
        },
        {
          name: this.translateService.instant('tezblock-table.transaction.amount'),
          field: 'amount',
          data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options }),
          template: Template.amount,
          sortable: true
        },
        {
          name: this.translateService.instant('tezblock-table.transaction.fee'),
          field: 'fee',
          data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
          template: Template.amount,
          sortable: true
        }
      ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Delegation]: (options: Options) =>
      [
        {
          name: this.translateService.instant('tezblock-table.delegation.delegator'),
          field: 'source',
          width: '1',
          template: Template.address,
          data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
        },
        {
          field: 'applied',
          width: '1',
          template: Template.symbol,
          data: (item: Transaction) => ({ data: item.outgoing })
        },
        {
          name: this.translateService.instant('tezblock-table.delegation.baker'),
          field: 'delegate',
          width: '1',
          template: Template.address,
          data: (item: Transaction) => ({
            data: item.delegate || 'undelegate',
            options: { showFullAddress: false, pageId: options.pageId, isText: !item.delegate ? true : undefined }
          })
        },
        {
          name: this.translateService.instant('tezblock-table.delegation.age'),
          field: 'timestamp',
          template: Template.timestamp,
          sortable: true
        },
        {
          name: this.translateService.instant('tezblock-table.delegation.amount'),
          field: 'delegatedBalance',
          template: Template.amount,
          data: (item: Transaction) => ({ data: { amount: item.delegatedBalance, timestamp: item.timestamp }, options }),
          sortable: false // delegatedBalance is joined property from accounts
        }
      ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Origination]: (options: Options) =>
      [
        {
          name: this.translateService.instant('tezblock-table.origination.new-account'),
          field: 'originated_contracts',
          template: Template.address,
          data: (item: Transaction) => ({ data: item.originated_contracts, options: { showFullAddress: false, pageId: options.pageId } })
        },
        {
          name: this.translateService.instant('tezblock-table.origination.balance'),
          field: 'originatedBalance',
          template: Template.amount,
          data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options }),
          sortable: true
        },
        {
          name: this.translateService.instant('tezblock-table.origination.age'),
          field: 'timestamp',
          template: Template.timestamp,
          sortable: true
        },
        {
          name: this.translateService.instant('tezblock-table.origination.originator'),
          field: 'source',
          width: '1',
          template: Template.address,
          data: (item: Transaction) => ({ data: item.source, options: { showFullAddress: false, pageId: options.pageId } })
        },
        {
          name: this.translateService.instant('tezblock-table.origination.baker'),
          field: 'delegate',
          width: '1',
          template: Template.address,
          data: (item: Transaction) => ({ data: item.delegate, options: { showFullAddress: false, pageId: options.pageId } })
        },
        {
          name: this.translateService.instant('tezblock-table.origination.fee'),
          field: 'fee',
          template: Template.amount,
          data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
          sortable: true
        }
      ].concat(<any>blockAndTxHashColumns),

    [OperationTypes.Endorsement]: (options: Options) => [
      {
        name: this.translateService.instant('tezblock-table.endorsement.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.slots'),
        field: 'slots',
        sortable: false
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.endorsed-level'),
        field: 'level',
        template: Template.block
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.block'),
        field: 'block_level',
        template: Template.block,
        sortable: true
      },
      {
        name: this.translateService.instant('tezblock-table.endorsement.tx-hash'),
        field: 'operation_group_hash',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
      }
    ],

    [OperationTypes.Ballot]: (options: Options) =>
      [
        {
          name: this.translateService.instant('tezblock-table.ballot.ballot'),
          field: 'ballot'
        },
        {
          name: this.translateService.instant('tezblock-table.ballot.age'),
          field: 'timestamp',
          template: Template.timestamp,
          sortable: true
        },
        {
          name: this.translateService.instant('tezblock-table.ballot.kind'),
          field: 'kind',
          sortable: false
        },
        {
          name: this.translateService.instant('tezblock-table.ballot.voting-period'),
          field: 'voting_period',
          sortable: false
        },
        {
          name: this.translateService.instant('tezblock-table.ballot.number-of-votes'),
          field: 'votes',
          sortable: false
        },
        {
          name: this.translateService.instant('tezblock-table.ballot.proposal-hash'),
          field: 'proposal',
          template: Template.hash,
          data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } })
        }
      ].concat(<any>blockAndTxHashColumns)
  }

  bakerColumns: { [key: string]: (options: { showFiatValue: boolean }) => Column[] } = {
    [OperationTypes.BakingRights]: (options?: { showFiatValue?: boolean }) => [
      {
        name: this.translateService.instant('baker-table.baking-rights.cycle'),
        field: 'cycle',
        template: Template.basic
      },
      {
        name: this.translateService.instant('baker-table.baking-rights.number-of-bakings'),
        field: 'bakingsCount',
        template: Template.basic
      },
      {
        name: this.translateService.instant('baker-table.baking-rights.block-rewards'),
        field: 'blockRewards',
        template: Template.amount,
        data: (item: AggregatedBakingRights) => ({ data: { amount: item.blockRewards }, options })
      },
      {
        name: this.translateService.instant('baker-table.baking-rights.deposits'),
        field: 'deposits',
        template: Template.amount,
        data: (item: AggregatedBakingRights) => ({ data: { amount: item.deposits }, options })
      },
      {
        name: this.translateService.instant('baker-table.baking-rights.fees'),
        field: 'fees',
        template: Template.amount,
        data: (item: AggregatedBakingRights) => ({ data: { amount: item.fees }, options })
      }
    ],

    [OperationTypes.EndorsingRights]: (options?: { showFiatValue?: boolean }) => [
      {
        name: this.translateService.instant('baker-table.endorsing-rights.cycle'),
        field: 'cycle',
        template: Template.basic
      },
      {
        name: this.translateService.instant('baker-table.endorsing-rights.number-of-endorsements'),
        field: 'endorsementsCount',
        template: Template.basic
      },
      {
        name: this.translateService.instant('baker-table.endorsing-rights.endorsement-rewards'),
        field: 'endorsementRewards',
        template: Template.amount,
        data: (item: AggregatedEndorsingRights) => ({ data: { amount: item.endorsementRewards }, options })
      },
      {
        name: this.translateService.instant('baker-table.endorsing-rights.deposits'),
        field: 'deposits',
        template: Template.amount,
        data: (item: AggregatedEndorsingRights) => ({ data: { amount: item.deposits }, options })
      }
    ],

    [OperationTypes.Rewards]: (options?: { showFiatValue?: boolean }) => [
      {
        name: this.translateService.instant('baker-table.rewards.cycle'),
        field: 'cycle',
        template: Template.basic
      },
      {
        name: this.translateService.instant('baker-table.rewards.delegations'),
        field: 'delegatedContracts',
        data: (item: TezosRewards) => ({ data: Array.isArray(item.delegatedContracts) ? item.delegatedContracts.length : null }),
        template: Template.basic
      },
      {
        name: this.translateService.instant('baker-table.rewards.staking-balance'),
        field: 'stakingBalance',
        data: (item: TezosRewards) => ({ data: { amount: item.stakingBalance }, options }),
        template: Template.amount
      },
      {
        name: this.translateService.instant('baker-table.rewards.block-rewards'),
        field: 'bakingRewards',
        data: (item: TezosRewards) => ({ data: { amount: item.bakingRewards }, options }),
        template: Template.amount
      },
      {
        name: this.translateService.instant('baker-table.rewards.endorsement-rewards'),
        field: 'endorsingRewards',
        data: (item: TezosRewards) => ({ data: { amount: item.endorsingRewards }, options }),
        template: Template.amount
      },
      {
        name: this.translateService.instant('baker-table.rewards.fees'),
        field: 'fees',
        data: (item: TezosRewards) => ({ data: { amount: item.fees }, options: { showFiatValue: false } }),
        template: Template.amount
      }
    ]
  }

  constructor(private translateService: TranslateService) {}
}
