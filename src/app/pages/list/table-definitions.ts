import { OperationTypes } from '@tezblock/domain/operations'
import { Column, Template, blockAndTxHashColumns } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { Block } from '@tezblock/interfaces/Block'
import { squareBrackets } from '@tezblock/domain/pattern'
import { Account } from '@tezblock/interfaces/Account'

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
      template: Template.timestamp,
      sortable: true
    },
    {
      name: 'Transaction Volume',
      field: 'volume',
      template: Template.amount,
      data: (item: Block) => ({ data: { amount: item.volume, timestamp: item.timestamp } })
    },
    {
      name: 'Fee',
      field: 'fee',
      template: Template.amount,
      data: (item: Block) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } })
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
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Amount',
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.amount, timestamp: item.timestamp }, options }),
        sortable: true
      },
      {
        name: 'Fees',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
        sortable: true
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
        template: Template.timestamp,
        sortable: true
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
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Balance',
        field: 'originatedBalance',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.originatedBalance, timestamp: item.timestamp }, options })
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
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
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
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Value',
        field: 'amount',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options })
      },
      {
        name: 'Fee',
        field: 'fee',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: item.fee, timestamp: item.timestamp }, options: { showFiatValue: false } }),
        sortable: true
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
      template: Template.timestamp,
      sortable: true
    },
    {
      name: 'Slots',
      field: 'slots'
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
      data: (item: Transaction) => ({ data: item.operation_group_hash, options: { kind: 'endorsement' } })
    }
  ],

  /* BALLOT */
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
        field: 'ballot',
        sortable: true
      },
      {
        name: 'Age',
        field: 'timestamp',
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Kind',
        field: 'kind',
        sortable: true
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
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Reward',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
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
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
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
        template: Template.timestamp,
        sortable: true
      },
      {
        name: 'Reward',
        template: Template.amount,
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
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
        data: (item: Transaction) => ({ data: { amount: null, timestamp: item.timestamp }, options })
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
      field: 'number_of_votes'
    },
    {
      name: 'Staking Balance',
      field: 'staking_balance',
      template: Template.amount,
      sortable: true
    },
    {
      name: '# of Delegators',
      field: 'number_of_delegators'
    }
  ],

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

  /* TOKEN CONTRACT */
  [OperationTypes.TokenContract]: () => [
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
      name: 'Total Supply',
      field: 'totalSupply'
    },
    {
      name: 'Description',
      field: 'description'
    }
  ],

  /* CONTRACT */
  [OperationTypes.Contract]: () => [
    {
      name: 'Account',
      field: 'account_id',
      width: '40%',
      template: Template.address,
      data: (item: Account) => ({ data: item.account_id, options: { showAlliasOrFullAddress: true } })
    },
    {
      name: 'Balance',
      field: 'balance',
      template: Template.amount,
      data: (item: any) => ({ data: { amount: item.balance } }),
      sortable: true
    },
    {
      name: 'Delegate',
      field: 'delegate_value',
      template: Template.address
    }
  ],

  /* ACCOUNT */
  [OperationTypes.Account]: () => [
    {
      name: 'Account',
      field: 'account_id',
      width: '50%',
      template: Template.address,
      data: (item: any) => ({ data: item.account_id, options: { showAlliasOrFullAddress: true } })
    },
    {
      name: 'Balance',
      field: 'balance',
      template: Template.amount,
      data: (item: any) => ({ data: { amount: item.balance } }),
      sortable: true
    }
  ]
}
