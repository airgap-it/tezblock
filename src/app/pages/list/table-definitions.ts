import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { squareBrackets } from '@tezblock/domain/pattern'

export const columns: { [key: string]: (options?: { showFiatValue?: boolean }) => Column[] } = {
  /* BLOCK */
  [OperationTypes.Block]: () => [
    {
      name: 'Baker',
      field: 'baker',
      width: '1',
      template: Template.address
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp
    },
    {
      name: 'Transaction Volume',
      field: 'volume',
      template: Template.amount
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Block) => ({ data: item.fee, options: { showFiatValue: false } })
    },
    {
      name: 'Transactions',
      field: 'txcount'
    },
    {
      name: 'Fitness',
      field: 'fitness'
    },
    {
      name: 'Block',
      field: 'level',
      template: Template.block
    }
  ],

  /* TANSACTION */
  [OperationTypes.Transaction]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'From',
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
        name: 'To',
        field: 'destination',
        width: '1',
        template: Template.address
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Amount',
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.amount, options })
      },
      {
        name: 'Fees',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
      },
      {
        name: 'Parameters',
        field: 'parameters',
        template: Template.modal
      }
    ].concat(<any>blockAndTxHashColumns),

  /* ACTIVATION */
  [OperationTypes.Activation]: () =>
    [
      {
        name: 'Account',
        field: 'pkh',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true } })
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Secret',
        field: 'secret'
      }
    ].concat(<any>blockAndTxHashColumns),

  /* ORIGINATION */
  [OperationTypes.Origination]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'New Account',
        field: 'originated_contracts',
        width: '1',
        template: Template.address
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Balance',
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.originatedBalance, options })
      },
      {
        name: 'Originator',
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        })
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
      }
    ].concat(<any>blockAndTxHashColumns),

  /* DELEGATION */
  [OperationTypes.Delegation]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'Delegator',
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
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        })
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Value',
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options })
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } })
      },
      {
        name: 'Gas Limit',
        field: 'gas_limit'
      }
    ].concat(<any>blockAndTxHashColumns),

  /* ENDORSEMENT */
  [OperationTypes.Endorsement]: () => [
    {
      name: 'Endorser',
      field: 'delegate',
      template: Template.address
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp
    },
    {
      name: 'Slots',
      field: 'slots'
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
    }
  ],

  /* BALLOUT */
  [OperationTypes.Ballot]: () =>
    [
      {
        name: 'Baker',
        field: 'source',
        width: '1',
        template: Template.address
      },
      {
        name: 'Ballot',
        field: 'ballot'
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Kind',
        field: 'kind'
      },
      {
        name: 'Voting Period',
        field: 'voting_period'
      },
      {
        name: '# of Votes',
        field: 'votes'
      },
      {
        name: 'Proposal',
        field: 'proposal',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } })
      }
    ].concat(<any>blockAndTxHashColumns),

  /* DOUBE BAKING */
  [OperationTypes.DoubleBakingEvidenceOverview]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'Baker',
        template: Template.address
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Reward',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options })
      },
      {
        name: 'Offender',
        template: Template.address
      },
      {
        name: 'Denounced Level',
        template: Template.block
      },
      {
        name: 'Lost Amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options })
      }
    ].concat(<any>blockAndTxHashColumns),

  /* DOUBLE ENDORSEMENT */
  [OperationTypes.DoubleEndorsementEvidenceOverview]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'Baker',
        template: Template.address
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp
      },
      {
        name: 'Reward',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options })
      },
      {
        name: 'Offender',
        template: Template.address
      },
      {
        name: 'Denounced Level',
        template: Template.block
      },
      {
        name: 'Lost Amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options })
      }
    ].concat(<any>blockAndTxHashColumns),

  /* PROPOSAL */
  [OperationTypes.ProposalOverview]: () => [
    {
      name: 'Proposal',
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.proposal.replace(squareBrackets, ''), options: { kind: 'proposal' } })
    },
    {
      name: 'Proposal Hash',
      field: 'proposal',
      data: (item: Transaction) => ({ data: item.proposal.replace(squareBrackets, '') })
    },
    {
      name: 'Period',
      field: 'period'
    }
  ],

  /* CONTRACT */
  [OperationTypes.Contract]: () => [
    {
      name: 'Token',
      field: 'id',
      template: Template.address
    },
    {
      name: 'Contract Address',
      field: 'id',
      template: Template.address,
      data: (item: any) => ({ data: item.id, options: { showFullAddress: true, forceIdenticon: true } })
    },
    {
      name: 'Symbol',
      field: 'symbol'
    },
    {
      name: 'Description',
      field: 'description'
    }
  ]
}
