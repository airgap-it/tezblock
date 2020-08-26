import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { squareBrackets } from '@tezblock/domain/pattern'
import { Account } from '@tezblock/domain/account'
import { TranslateService } from '@ngx-translate/core'

export const columns: { [key: string]: (options?: { showFiatValue?: boolean }, translateService?: TranslateService) => Column[] } = {
  /* BLOCK */
  [OperationTypes.Block]: (options: {}, translateService?: TranslateService) => [
    {
      name: translateService.instant('tezblock-table.block-list.baker'),
      field: 'baker',
      width: '1',
      template: Template.address
    },
    {
      name: translateService.instant('tezblock-table.block-list.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: translateService.instant('tezblock-table.block-list.transaction-volume'),
      field: 'volume',
      template: Template.amount,
      data: (item: Block) => ({ data: item.volume, options: { comparisonTimestamp: item.timestamp } })
    },
    {
      name: translateService.instant('tezblock-table.block-list.fee'),
      field: 'fee',
      template: Template.amount,
      data: (item: Block) => ({
        data: item.fee,
        options: { showFiatValue: false, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
      })
    },
    {
      name: translateService.instant('tezblock-table.block-list.transactions'),
      field: 'txcount'
    },
    {
      name: translateService.instant('tezblock-table.block-list.fitness'),
      field: 'fitness'
    },
    {
      name: translateService.instant('tezblock-table.block-list.block'),
      field: 'level',
      template: Template.block,
      sortable: true
    }
  ],

  /* TANSACTION */
  [OperationTypes.Transaction]: (options: { showFiatValue?: boolean } = { showFiatValue: true }, translateService: TranslateService) =>
    [
      {
        name: translateService.instant('tezblock-table.transaction-list.from'),
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
        name: translateService.instant('tezblock-table.transaction-list.to'),
        field: 'destination',
        width: '1',
        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.transaction-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.transaction-list.amount'),
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.amount, options: { ...options, comparisonTimestamp: item.timestamp } }),
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.transaction-list.fees'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({
          data: item.fee,
          options: { showFiatValue: false, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-2' }
        }),
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.transaction-list.parameters'),
        field: 'parameters',
        template: Template.modal
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* ACTIVATION */
  [OperationTypes.Activation]: (options: {}, translateService?: TranslateService) =>
    [
      {
        name: translateService.instant('tezblock-table.activation-list.account'),
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true } })
      },
      {
        name: translateService.instant('tezblock-table.activation-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.activation-list.secret'),
        field: 'secret'
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* ORIGINATION */
  [OperationTypes.Origination]: (options: { showFiatValue?: boolean } = { showFiatValue: true }, translateService: TranslateService) =>
    [
      {
        name: translateService.instant('tezblock-table.origination-list.new-account'),
        field: 'originated_contracts',
        width: '1',
        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.origination-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.origination-list.balance'),
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.originatedBalance, options: { ...options, comparisonTimestamp: item.timestamp } })
      },
      {
        name: translateService.instant('tezblock-table.origination-list.originator'),
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.origination-list.baker'),
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        })
      },
      {
        name: translateService.instant('tezblock-table.origination-list.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({
          data: item.fee,
          options: { showFiatValue: false, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
        }),
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* DELEGATION */
  [OperationTypes.Delegation]: (options: { showFiatValue?: boolean } = { showFiatValue: true }, translateService: TranslateService) =>
    [
      {
        name: translateService.instant('tezblock-table.delegation-list.delegator'),
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
        name: translateService.instant('tezblock-table.delegation-list.baker'),
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        })
      },
      {
        name: translateService.instant('tezblock-table.delegation-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.delegation-list.value'),
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { ...options, comparisonTimestamp: item.timestamp } })
      },
      {
        name: translateService.instant('tezblock-table.delegation-list.fee'),
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({
          data: item.fee,
          options: { showFiatValue: false, comparisonTimestamp: item.timestamp, digitsInfo: '1.2-8' }
        }),
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.delegation-list.gas-limit'),
        field: 'gas_limit'
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* ENDORSEMENT */
  [OperationTypes.Endorsement]: (options: {}, translateService?: TranslateService) => [
    {
      name: translateService.instant('tezblock-table.endorsement-list.endorser'),
      field: 'delegate',
      template: Template.address
    },
    {
      name: translateService.instant('tezblock-table.endorsement-list.age'),
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: translateService.instant('tezblock-table.endorsement-list.slots'),
      field: 'slots'
    },
    {
      name: translateService.instant('tezblock-table.endorsement-list.block'),
      field: 'block_level',
      template: Template.block,
      sortable: true
    },
    {
      name: translateService.instant('tezblock-table.endorsement-list.tx-hash'),
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
    }
  ],

  /* BALLOT */
  [OperationTypes.Ballot]: (options: {}, translateService?: TranslateService) =>
    [
      {
        name: translateService.instant('tezblock-table.votes-list.baker'),
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.votes-list.ballot'),
        field: 'ballot',
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.votes-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.votes-list.kind'),
        field: 'kind',
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.votes-list.voting-period'),
        field: 'voting_period'
      },
      {
        name: translateService.instant('tezblock-table.votes-list.number-of-votes'),
        field: 'votes'
      },
      {
        name: translateService.instant('tezblock-table.votes-list.proposal'),
        field: 'proposal',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } })
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* DOUBE BAKING */
  [OperationTypes.DoubleBakingEvidenceOverview]: (
    options: { showFiatValue?: boolean } = { showFiatValue: true },
    translateService: TranslateService
  ) =>
    [
      {
        name: translateService.instant('tezblock-table.double-baking-list.baker'),
        field: 'baker',

        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.double-baking-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.double-baking-list.reward'),
        field: 'reward',

        template: Template.amount,
        data: (item: Transaction) => ({ data: item.reward, options: { ...options, comparisonTimestamp: item.timestamp } })
      },
      {
        name: translateService.instant('tezblock-table.double-baking-list.offender'),
        field: 'offender',

        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.double-baking-list.denounced-level'),
        field: 'denouncedLevel',

        template: Template.block
      },
      {
        name: translateService.instant('tezblock-table.double-baking-list.lost-amount'),
        field: 'lostAmount',

        template: Template.amount,
        data: (item: Transaction) => ({ data: item.lostAmount, options: { ...options, comparisonTimestamp: item.timestamp } })
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* DOUBLE ENDORSEMENT */
  [OperationTypes.DoubleEndorsementEvidenceOverview]: (
    options: { showFiatValue?: boolean } = { showFiatValue: true },
    translateService: TranslateService
  ) =>
    [
      {
        name: translateService.instant('tezblock-table.double-endorsement-list.baker'),
        field: 'baker',

        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.double-endorsement-list.age'),
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: translateService.instant('tezblock-table.double-endorsement-list.reward'),
        field: 'reward',

        template: Template.amount,
        data: (item: Transaction) => ({ data: item.reward, options: { ...options, comparisonTimestamp: item.timestamp } })
      },
      {
        name: translateService.instant('tezblock-table.double-endorsement-list.offender'),
        field: 'offender',
        template: Template.address
      },
      {
        name: translateService.instant('tezblock-table.double-endorsement-list.denounced-level'),
        field: 'denouncedLevel',
        template: Template.block
      },
      {
        name: translateService.instant('tezblock-table.double-endorsement-list.lost-amount'),
        field: 'lostAmount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.lostAmount, options: { ...options, comparisonTimestamp: item.timestamp } })
      }
    ].concat(<any>blockAndTxHashColumns(translateService)),

  /* PROPOSAL */
  [OperationTypes.ProposalOverview]: (options: {}, translateService?: TranslateService) => [
    {
      name: translateService.instant('tezblock-table.proposal-list.proposal'),
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.proposal.replace(squareBrackets, ''), options: { kind: 'proposal' } })
    },
    {
      name: translateService.instant('tezblock-table.proposal-list.proposal-hash'),
      field: 'proposal',
      data: (item: Transaction) => ({ data: item.proposal.replace(squareBrackets, '') })
    },
    {
      name: translateService.instant('tezblock-table.proposal-list.period'),
      field: 'period'
    }
  ],

  /* CONTRACT */
  [OperationTypes.Contract]: (options: {}, translateService?: TranslateService) => [
    {
      name: translateService.instant('tezblock-table.contract-list.account'),
      field: 'account_id',
      width: '40%',
      template: Template.address,
      data: (item: Account) => ({ data: item.account_id, options: { showAlliasOrFullAddress: true } })
    },
    {
      name: translateService.instant('tezblock-table.contract-list.balance'),
      field: 'balance',
      template: Template.amount,
      data: (item: any) => ({ data: item.balance }),
      sortable: true
    },
    {
      name: translateService.instant('tezblock-table.contract-list.baker'),
      field: 'delegate_value',
      template: Template.address
    }
  ]
}
