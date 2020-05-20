import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { squareBrackets } from '@tezblock/domain/pattern'
import { Account } from '@tezblock/interfaces/Account'
import { getConventer, TokenContract } from '@tezblock/domain/contract'
import { TranslateService } from '@ngx-translate/core'

export const columns: { [key: string]: (options?: { showFiatValue?: boolean; translate?: any }) => Column[] } = {
  /* BLOCK */
  [OperationTypes.Block]: (options: { translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.block-list.baker'),
      field: 'baker',
      width: '1',
      template: Template.address
    },
    {
      name: options.translate.instant('tezblock-table.block-list.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.block-list.transaction-volume'),
      field: 'volume',
      template: Template.amount,
      data: (item: Block) => ({ data: { amount: item.volume, timestamp: item.timestamp } })
    },
    {
      name: options.translate.instant('tezblock-table.block-list.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Block) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } })
    },
    {
      name: options.translate.instant('tezblock-table.block-list.transactions'),
      field: 'txcount'
    },
    {
      name: options.translate.instant('tezblock-table.block-list.fitness'),
      field: 'fitness'
    },
    {
      name: options.translate.instant('tezblock-table.block-list.block'),
      field: 'level',
      template: Template.block,
      sortable: true
    }
  ],

  /* TANSACTION */
  [OperationTypes.Transaction]: (
    options: { showFiatValue?: boolean; translate?: any } = { showFiatValue: true, translate: TranslateService }
  ) =>
    [
      {
        name: options.translate.instant('tezblock-table.transaction-list.from'),
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol
      },
      {
        name: options.translate.instant('tezblock-table.transaction-list.to'),
        field: 'destination',
        width: '1',
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.transaction-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.transaction-list.amount'),
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options }),
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.transaction-list.fees'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.transaction-list.parameters'),
        field: 'parameters',
        template: Template.modal
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* ACTIVATION */
  [OperationTypes.Activation]: (options: { translate?: TranslateService }) =>
    [
      {
        name: options.translate.instant('tezblock-table.activation-list.account'),
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true } })
      },
      {
        name: options.translate.instant('tezblock-table.activation-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.activation-list.secret'),
        field: 'secret'
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* ORIGINATION */
  [OperationTypes.Origination]: (
    options: { showFiatValue?: boolean; translate?: any } = { showFiatValue: true, translate: TranslateService }
  ) =>
    [
      {
        name: options.translate.instant('tezblock-table.origination-list.new-account'),
        field: 'originated_contracts',
        width: '1',
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.origination-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.origination-list.balance'),
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options })
      },
      {
        name: options.translate.instant('tezblock-table.origination-list.originator'),
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.origination-list.baker'),
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        })
      },
      {
        name: options.translate.instant('tezblock-table.origination-list.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* DELEGATION */
  [OperationTypes.Delegation]: (
    options: { showFiatValue?: boolean; translate?: any } = { showFiatValue: true, translate: TranslateService }
  ) =>
    [
      {
        name: options.translate.instant('tezblock-table.delegation-list.delegator'),
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol
      },
      {
        name: options.translate.instant('tezblock-table.delegation-list.baker'),
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        })
      },
      {
        name: options.translate.instant('tezblock-table.delegation-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.delegation-list.value'),
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options })
      },
      {
        name: options.translate.instant('tezblock-table.delegation-list.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.delegation-list.gas-limit'),
        field: 'gas_limit'
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* ENDORSEMENT */
  [OperationTypes.Endorsement]: (options: { translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.endorsement-list.endorser'),
      field: 'delegate',
      template: Template.address
    },
    {
      name: options.translate.instant('tezblock-table.endorsement-list.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.endorsement-list.slots'),
      field: 'slots'
    },
    {
      name: options.translate.instant('tezblock-table.endorsement-list.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.endorsement-list.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
    }
  ],

  /* BALLOT */
  [OperationTypes.Ballot]: (options: { translate?: TranslateService }) =>
    [
      {
        name: options.translate.instant('tezblock-table.votes-list.baker'),
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.votes-list.ballot'),
        field: 'ballot',
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.votes-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.votes-list.kind'),
        field: 'kind',
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.votes-list.voting-period'),
        field: 'voting_period'
      },
      {
        name: options.translate.instant('tezblock-table.votes-list.number-of-votes'),
        field: 'votes'
      },
      {
        name: options.translate.instant('tezblock-table.votes-list.proposal'),
        field: 'proposal',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } })
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* DOUBE BAKING */
  [OperationTypes.DoubleBakingEvidenceOverview]: (
    options: { showFiatValue?: boolean; translate?: any } = { showFiatValue: true, translate: TranslateService }
  ) =>
    [
      {
        name: options.translate.instant('tezblock-table.double-baking-list.baker'),
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.double-baking-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.double-baking-list.reward'),
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
      },
      {
        name: options.translate.instant('tezblock-table.double-baking-list.offender'),
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.double-baking-list.denounced-level'),
        template: Template.block
      },
      {
        name: options.translate.instant('tezblock-table.double-baking-list.lost-amount'),
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* DOUBLE ENDORSEMENT */
  [OperationTypes.DoubleEndorsementEvidenceOverview]: (
    options: { showFiatValue?: boolean; translate?: any } = { showFiatValue: true, translate: TranslateService }
  ) =>
    [
      {
        name: options.translate.instant('tezblock-table.double-endorsement-list.baker'),
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.double-endorsement-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: options.translate.instant('tezblock-table.double-endorsement-list.reward'),
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
      },
      {
        name: options.translate.instant('tezblock-table.double-endorsement-list.offender'),
        template: Template.address
      },
      {
        name: options.translate.instant('tezblock-table.double-endorsement-list.denounced-level'),
        template: Template.block
      },
      {
        name: options.translate.instant('tezblock-table.double-endorsement-list.lost-amount'),
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
      }
    ].concat(<any>blockAndTxHashColumns(options.translate)),

  /* PROPOSAL */
  [OperationTypes.ProposalOverview]: (options: { translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.proposal-list.proposal'),
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.proposal.replace(squareBrackets, ''), options: { kind: 'proposal' } })
    },
    {
      name: options.translate.instant('tezblock-table.proposal-list.proposal-hash'),
      field: 'proposal',
      data: (item: Transaction) => ({ data: item.proposal.replace(squareBrackets, '') })
    },
    {
      name: options.translate.instant('tezblock-table.proposal-list.period'),
      field: 'period'
    }
  ],

  /* CONTRACT */
  [OperationTypes.Contract]: (options: { translate?: TranslateService }) => [
    {
      name: options.translate.instant('tezblock-table.contract-list.account'),
      field: 'account_id',
      width: '40%',
      template: Template.address,
      data: (item: Account) => ({ data: item.account_id, options: { showAlliasOrFullAddress: true } })
    },
    {
      name: options.translate.instant('tezblock-table.contract-list.balance'),
      field: 'balance',
      template: Template.amount,
      data: (item: any) => ({ data: { amount: item.balance } }),
      sortable: true
    },
    {
      name: options.translate.instant('tezblock-table.contract-list.baker'),
      field: 'delegate_value',
      template: Template.address
    }
  ]
}
