import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'

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

export interface OperationErrorMessage {
  title: string
  description: string
}

export interface OperationErrorsById {
  id: string
  errors: OperationError[]
}

export const operationErrorToMessage = (
  operationError: OperationError,
  amountConverterPipe: AmountConverterPipe
): OperationErrorMessage => {
  const amountConverterArgs = {
    protocolIdentifier: 'xtz',
    maxDigits: 6,
    fontSmall: true,
    fontColor: true
  }

  if (operationError.id.indexOf('balance_too_low') !== -1) {
    return {
      title: 'Balance too low',
      description: `An operation tried to spend ${amountConverterPipe.transform(
        operationError.amount,
        amountConverterArgs
      )} ꜩ while the contract has only ${amountConverterPipe.transform(operationError.balance, amountConverterArgs)} ꜩ`
    }
  }

  if (operationError.id.indexOf('cannot_pay_storage_fee') !== -1) {
    return {
      title: 'Cannot pay storage fees',
      description: 'The storage fee is higher than the contract balance'
    }
  }

  return {
    title: operationError.id,
    description: undefined
  }
}
