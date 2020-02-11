import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'

export const columns: { [key: string]: (options?: { showFiatValue?: boolean }) => Column[] } = {
  /* BLOCK */
  [OperationTypes.Block]: () => [
    {
      name: 'Baker',
      field: 'baker',
      width: '1',
      template: Template.address,
      sortable: false
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: 'Transaction Volume',
      field: 'volume',
      template: Template.amount,
      sortable: true
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Block) => ({ data: item.fee, options: { showFiatValue: false } }),
      sortable: true
    },
    {
      name: 'Transactions',
      field: 'txcount',
      sortable: false
    },
    {
      name: 'Fitness',
      field: 'fitness',
      sortable: false
    },
    {
      name: 'Block',
      field: 'level',
      template: Template.block,
      sortable: true
    }
  ],

  /* TANSACTION */
  [OperationTypes.Transaction]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'From',
        field: 'source',
        width: '1',
        template: Template.address,
        sortable: false
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        sortable: false
      },
      {
        name: 'To',
        field: 'destination',
        width: '1',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Amount',
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.amount, options }),
        sortable: true
      },
      {
        name: 'Fees',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
        sortable: true
      },
      {
        name: 'Parameters',
        field: 'parameters',
        template: Template.modal,
        sortable: false
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
        data: (item: Transaction) => ({ data: item.pkh, options: { showFullAddress: true } }),
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Secret',
        field: 'secret',
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns),

  /* ORIGINATION */
  [OperationTypes.Origination]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'New Account',
        field: 'originated_contracts',
        width: '1',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Balance',
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.originatedBalance, options }),
        sortable: false
      },
      {
        name: 'Originator',
        field: 'source',
        width: '1',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        }),
        sortable: false
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
        sortable: true
      }
    ].concat(<any>blockAndTxHashColumns),

  /* DELEGATION */
  [OperationTypes.Delegation]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'Delegator',
        field: 'source',
        width: '1',
        template: Template.address,
        sortable: false
      },
      {
        field: 'applied',
        width: '1',
        template: Template.symbol,
        sortable: false
      },
      {
        name: 'Baker',
        field: 'delegate',
        width: '1',
        template: Template.address,
        data: (item: Transaction) => ({
          data: item.delegate || 'undelegate',
          options: { showFullAddress: false, isText: item.delegate ? undefined : true }
        }),
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: false
      },
      {
        name: 'Value',
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options }),
        sortable: false
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: item.fee, options: { showFiatValue: false } }),
        sortable: false
      },
      {
        name: 'Gas Limit',
        field: 'gas_limit',
        sortable: false
      }
    ].concat(<any>blockAndTxHashColumns),

  /* ENDORSEMENT */
  [OperationTypes.Endorsement]: () => [
    {
      name: 'Endorser',
      field: 'delegate',
      template: Template.address,
      sortable: false
    },
    {
      name: 'Age',
      field: 'timestamp',
      template: Template.timestamp,
      sortable: true
    },
    {
      name: 'Slots',
      field: 'slots',
      sortable: false
    },
    {
      name: 'Block',
      field: 'block_level',
      template: Template.block,
      sortable: true
    },
    {
      name: 'Tx Hash',
      field: 'operation_group_hash',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } }),
      sortable: false
    }
  ],

  /* BALLOUT */
  [OperationTypes.Ballot]: () =>
    [
      {
        name: 'Baker',
        field: 'source',
        width: '1',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Ballot',
        field: 'ballot',
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: false
      },
      {
        name: 'Kind',
        field: 'kind',
        sortable: false
      },
      {
        name: 'Voting Period',
        field: 'voting_period',
        sortable: false
      },
      {
        name: '# of Votes',
        field: 'votes',
        sortable: false
      },
      {
        name: 'Proposal',
        field: 'proposal',
        template: Template.hash,
        data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } }),
        sortable: false
      }
    ].concat(<any>blockAndTxHashColumns),

  /* DOUBE BAKING */
  [OperationTypes.DoubleBakingEvidenceOverview]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'Baker',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Reward',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options }),
        sortable: false
      },
      {
        name: 'Offender',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Denounced Level',
        template: Template.block,
        sortable: false
      },
      {
        name: 'Lost Amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options }),
        sortable: false
      }
    ].concat(<any>blockAndTxHashColumns),

  /* DOUBLE ENDORSEMENT */
  [OperationTypes.DoubleEndorsementEvidenceOverview]: (options: { showFiatValue?: boolean } = { showFiatValue: true }) =>
    [
      {
        name: 'Baker',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Reward',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options }),
        sortable: false
      },
      {
        name: 'Offender',
        template: Template.address,
        sortable: false
      },
      {
        name: 'Denounced Level',
        template: Template.block,
        sortable: false
      },
      {
        name: 'Lost Amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: null, options }),
        sortable: false
      }
    ].concat(<any>blockAndTxHashColumns),

  /* BAKER */
  [OperationTypes.BakerOverview]: () => [
    {
      name: 'Baker',
      field: 'pkh',
      template: Template.address,
      sortable: true
    },
    {
      name: 'Balance',
      field: 'balance',
      template: Template.amount,
      sortable: true
    },
    {
      name: '# of Votes',
      field: 'number_of_votes',
      sortable: false
    },
    {
      name: 'Staking Balance',
      field: 'staking_balance',
      template: Template.amount,
      sortable: true
    },
    {
      name: '# of Delegators',
      field: 'number_of_delegators',
      sortable: false
    }
  ],

  /* PROPOSAL */
  [OperationTypes.ProposalOverview]: () => [
    {
      name: 'Proposal',
      field: 'proposal',
      template: Template.hash,
      data: (item: Transaction) => ({ data: item.proposal, options: { kind: 'proposal' } }),
      sortable: false
    },
    {
      name: 'Proposal Hash',
      field: 'proposal',
      sortable: true
    },
    {
      name: 'Period',
      field: 'period',
      sortable: true
    }
  ]
}
