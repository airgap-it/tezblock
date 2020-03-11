export enum OperationTypes {
  Transaction = 'transaction',
  Delegation = 'delegation',
  Origination = 'origination',
  Endorsement = 'endorsement',
  Reveal = 'reveal',
  Ballot = 'ballot',
  BallotOverview = 'ballot_overview',
  BakingRights = 'baking_rights',
  EndorsingRights = 'endorsing_rights',
  Activation = 'activate_account',
  Overview = 'overview',
  OriginationOverview = 'origination_overview',
  DelegationOverview = 'delegation_overview',
  EndorsementOverview = 'endorsement_overview',
  Rewards = 'rewards',
  DoubleBakingEvidenceOverview = 'double_baking_evidence_overview',
  DoubleEndorsementEvidenceOverview = 'double_endorsement_evidence_overview',
  BakerOverview = 'baker_overview',
  ProposalOverview = 'proposal_overview',

  // these are not operation types...
  Block = 'block',
  TokenContract = 'token contract',
  Contract = 'contract',
  Account = 'account'
}

export interface OperationError {
  kind: string
  id: string
  contract?: string
  balance?: string
  amount?: string
}

export interface RPCContent {
  metadata?: {
    internal_operation_results?: {
      result: {
        errors?: OperationError[]
      }
    }[]
    operation_result?: {
      errors: OperationError[]
    }
  }
}

export interface RPCBlocksOpertions {
  hash: string
  contents?: RPCContent[]
}

export interface OperationErrorsById {
  id: string
  error: OperationError[]
}

export interface OperationErrorMessage {
  title: string
  description: string
}

const errorMessages: { [key: string]: OperationErrorMessage } = {
  cannot_pay_storage_fee: {
    title: 'Cannot pay storage fees',
    description: 'The storage fee is higher than the contract balance'
  },
  balance_too_low: {
    title: 'Balance too low',
    description: 'An operation tried to spend {{amount}} ꜩ while the contract has only {{balance}} ꜩ'
  }
}
