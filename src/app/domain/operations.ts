import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { TableState } from '@tezblock/domain/table'

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
  delegate?: string
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

// tslint:disable-next-line: cyclomatic-complexity
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

  if (operationError.id.indexOf('assertion') !== -1) {
    return {
      title: 'Assertion failure',
      description: `A fatal assertion failed`
    }
  }

  if (operationError.id.indexOf('baking.insufficient_proof_of_work') !== -1) {
    return {
      title: 'Insufficient block proof-of-work stamp',
      description: `The block's proof-of-work stamp is insufficient`
    }
  }

  if (operationError.id.indexOf('baking.invalid_block_signature') !== -1) {
    return {
      title: 'Invalid block signature',
      description: `A block was not signed with the expected private key.`
    }
  }

  if (operationError.id.indexOf('baking.invalid_fitness_gap') !== -1) {
    return {
      title: 'Invalid fitness gap',
      description: `The gap of fitness is out of bounds`
    }
  }

  if (operationError.id.indexOf('baking.invalid_signature') !== -1) {
    return {
      title: 'Invalid block signature',
      description: `The block's signature is invalid`
    }
  }

  if (operationError.id.indexOf('baking.timestamp_too_early') !== -1) {
    return {
      title: 'Block forged too early',
      description: `The block timestamp is before the first slot for this baker at this`
    }
  }

  if (operationError.id.indexOf('baking.unexpected_endorsement') !== -1) {
    return {
      title: 'Endorsement from unexpected delegate',
      description: `The operation is signed by a delegate without endorsement rights.`
    }
  }

  if (operationError.id.indexOf('block.inconsistent_double_baking_evidence') !== -1) {
    return {
      title: 'Inconsistent double baking evidence',
      description: `A double-baking evidence is inconsistent  (two distinct delegates)`
    }
  }

  if (operationError.id.indexOf('block.inconsistent_double_endorsement_evidence') !== -1) {
    return {
      title: 'Inconsistent double endorsement evidence',
      description: `A double-endorsement evidence is inconsistent  (two distinct`
    }
  }

  if (operationError.id.indexOf('block.invalid_commitment') !== -1) {
    return {
      title: 'Invalid commitment in block header',
      description: `The block header has invalid commitment.`
    }
  }

  if (operationError.id.indexOf('block.invalid_double_baking_evidence') !== -1) {
    return {
      title: 'Invalid double baking evidence',
      description: `A double-baking evidence is inconsistent  (two distinct level)`
    }
  }

  if (operationError.id.indexOf('block.invalid_double_endorsement_evidence') !== -1) {
    return {
      title: 'Invalid double endorsement evidence',
      description: `A double-endorsement evidence is malformed`
    }
  }

  if (operationError.id.indexOf('block.multiple_revelation') !== -1) {
    return {
      title: 'Multiple revelations were included in a manager operation',
      description: `A manager operation should not contain more than one revelation`
    }
  }

  if (operationError.id.indexOf('block.outdated_double_baking_evidence') !== -1) {
    return {
      title: 'Outdated double baking evidence',
      description: `A double-baking evidence is outdated.`
    }
  }

  if (operationError.id.indexOf('block.outdated_double_endorsement_evidence') !== -1) {
    return {
      title: 'Outdated double endorsement evidence',
      description: `A double-endorsement evidence is outdated.`
    }
  }

  if (operationError.id.indexOf('block.too_early_double_baking_evidence') !== -1) {
    return {
      title: 'Too early double baking evidence',
      description: `A double-baking evidence is in the future`
    }
  }

  if (operationError.id.indexOf('block.too_early_double_endorsement_evidence') !== -1) {
    return {
      title: 'Too early double endorsement evidence',
      description: `A double-endorsement evidence is in the future`
    }
  }

  if (operationError.id.indexOf('block.unrequired_double_baking_evidence') !== -1) {
    return {
      title: 'Unrequired double baking evidence',
      description: `A double-baking evidence is unrequired`
    }
  }

  if (operationError.id.indexOf('block.unrequired_double_endorsement_evidence') !== -1) {
    return {
      title: 'Unrequired double endorsement evidence',
      description: `A double-endorsement evidence is unrequired`
    }
  }

  if (operationError.id.indexOf('context.failed_to_decode_parameter') !== -1) {
    return {
      title: 'Failed to decode parameter',
      description: `Unexpected JSON object.`
    }
  }

  if (operationError.id.indexOf('context.failed_to_parse_parameter') !== -1) {
    return {
      title: 'Failed to parse parameter',
      description: `The protocol parameters are not valid JSON.`
    }
  }

  if (operationError.id.indexOf('balance_too_low') !== -1) {
    return {
      title: 'Balance too low',
      description: `An operation tried to spend ${amountConverterPipe.transform(
        operationError.amount,
        amountConverterArgs
      )} ꜩ while the account has only ${amountConverterPipe.transform(operationError.balance, amountConverterArgs)} ꜩ`
    }
  }

  if (operationError.id.indexOf('cannot_pay_storage_fee') !== -1) {
    return {
      title: 'Cannot pay storage fee',
      description: `The storage fee is higher than the contract balance`
    }
  }

  if (operationError.id.indexOf('counter_in_the_future') !== -1) {
    return {
      title: 'Invalid counter (not yet reached) in a manager operation',
      description: `An operation assumed a contract counter in the future`
    }
  }

  if (operationError.id.indexOf('counter_in_the_past') !== -1) {
    return {
      title: 'Invalid counter (already used) in a manager operation',
      description: `An operation assumed a contract counter in the past`
    }
  }

  if (operationError.id.indexOf('empty_transaction') !== -1) {
    return {
      title: 'Empty transaction',
      description: `Forbidden to credit 0ꜩ to a contract without code.`
    }
  }

  if (operationError.id.indexOf('failure') !== -1) {
    return {
      title: 'Contract storage failure',
      description: `Unexpected contract storage error`
    }
  }

  if (operationError.id.indexOf('invalid_contract_notation') !== -1) {
    return {
      title: 'Invalid contract notation',
      description: `A malformed contract notation was given to an RPC or in a script.`
    }
  }

  if (operationError.id.indexOf('manager.consume_roll_change') !== -1) {
    return {
      title: 'Consume roll change',
      description: `Change is not enough to consume a roll.`
    }
  }

  if (operationError.id.indexOf('manager.inconsistent_hash') !== -1) {
    return {
      title: 'Inconsistent public key hash',
      description: `A revealed manager public key is inconsistent with the announced`
    }
  }

  if (operationError.id.indexOf('manager.inconsistent_public_key') !== -1) {
    return {
      title: 'Inconsistent public key',
      description: `A provided manager public key is different with the public key`
    }
  }

  if (operationError.id.indexOf('manager.no_roll_for_delegate') !== -1) {
    return {
      title: 'No roll for delegate',
      description: `Delegate has no roll.`
    }
  }

  if (operationError.id.indexOf('manager.no_roll_snapshot_for_cycle') !== -1) {
    return {
      title: 'No roll snapshot for cycle',
      description: `A snapshot of the rolls distribution does not exist for this cycle.`
    }
  }

  if (operationError.id.indexOf('manager.unregistered_delegate') !== -1) {
    return {
      title: 'Unregistered delegate',
      description: `A contract cannot be delegated to an unregistered delegate`
    }
  }

  if (operationError.id.indexOf('non_existing_contract') !== -1) {
    return {
      title: 'Non existing contract',
      description: `A contract handle is not present in the context (either it never was`
    }
  }

  if (operationError.id.indexOf('previously_revealed_key') !== -1) {
    return {
      title: 'Manager operation already revealed',
      description: `One tried to revealed twice a manager public key`
    }
  }

  if (operationError.id.indexOf('unrevealed_key') !== -1) {
    return {
      title: 'Manager operation precedes key revelation',
      description: `One tried to apply a manager operation without revealing the manager`
    }
  }

  if (operationError.id.indexOf('unspendable_contract') !== -1) {
    return {
      title: 'Unspendable contract',
      description: `An operation tried to spend tokens from an unspendable contract`
    }
  }

  if (operationError.id.indexOf('delegate.already_active') !== -1) {
    return {
      title: 'Delegate already active',
      description: `Useless delegate reactivation`
    }
  }

  if (operationError.id.indexOf('delegate.balance_too_low_for_deposit') !== -1) {
    return {
      title: 'Balance too low for deposit',
      description: `Cannot freeze deposit when the balance is too low`
    }
  }

  if (operationError.id.indexOf('delegate.empty_delegate_account') !== -1) {
    return {
      title: 'Empty delegate account',
      description: `Cannot register a delegate when its implicit account is empty`
    }
  }

  if (operationError.id.indexOf('delegate.no_deletion') !== -1) {
    return {
      title: 'Forbidden delegate deletion',
      description: `Tried to unregister a delegate: ${operationError.delegate}`
    }
  }

  if (operationError.id.indexOf('delegate.unchanged') !== -1) {
    return {
      title: 'Unchanged delegated',
      description: `Contract already delegated to the given delegate`
    }
  }

  if (operationError.id.indexOf('empty_proposal') !== -1) {
    return {
      title: 'Empty proposal',
      description: `Proposal lists cannot be empty.`
    }
  }

  if (operationError.id.indexOf('gas_exhausted.block') !== -1) {
    return {
      title: 'Gas quota exceeded for the block',
      description: `The sum of gas consumed by all the operations in the block exceeds`
    }
  }

  if (operationError.id.indexOf('gas_exhausted.init_deserialize') !== -1) {
    return {
      title: 'Not enough gas for initial deserialization of script expresions',
      description: `Gas limit was not high enough to deserialize the transaction`
    }
  }

  if (operationError.id.indexOf('gas_exhausted.operation') !== -1) {
    return {
      title: 'Gas quota exceeded for the operation',
      description: `A script or one of its callee took more time than the operation said`
    }
  }

  if (operationError.id.indexOf('gas_limit_too_high') !== -1) {
    return {
      title: 'Gas limit out of protocol hard bounds',
      description: `A transaction tried to exceed the hard limit on gas`
    }
  }

  if (operationError.id.indexOf('implicit.empty_implicit_contract') !== -1) {
    return {
      title: 'Empty implicit contract',
      description: `No manager operations are allowed on an empty implicit `
    }
  }

  if (operationError.id.indexOf('implicit.empty_implicit_delegated_contract') !== -1) {
    return {
      title: 'Empty implicit delegated contract',
      description: `Emptying an implicit delegated account is not allowed.`
    }
  }

  if (operationError.id.indexOf('incorrect_number_of_endorsements') !== -1) {
    return {
      title: 'Incorrect number of endorsements',
      description: `The number of endorsements must be non-negative and at most the`
    }
  }

  if (operationError.id.indexOf('incorrect_priority') !== -1) {
    return {
      title: 'Incorrect priority',
      description: `Block priority must be non-negative.`
    }
  }

  if (operationError.id.indexOf('invalidSyntacticConstantError') !== -1) {
    return {
      title: 'Invalid constant (parse error)',
      description: `A compile-time constant was invalid for its expected form.`
    }
  }

  if (operationError.id.indexOf('invalid_arg') !== -1) {
    return {
      title: 'Invalid arg',
      description: `Negative multiple of periods are not allowed.`
    }
  }

  if (operationError.id.indexOf('invalid_binary_format') !== -1) {
    return {
      title: 'Invalid binary format',
      description: `Could not deserialize some piece of data from its binary`
    }
  }

  if (operationError.id.indexOf('invalid_fitness') !== -1) {
    return {
      title: 'Invalid fitness',
      description: `Fitness representation should be exactly 8 bytes long.`
    }
  }

  if (operationError.id.indexOf('invalid_proposal') !== -1) {
    return {
      title: 'Invalid proposal',
      description: `Ballot provided for a proposal that is not the current one.`
    }
  }

  if (operationError.id.indexOf('malformed_period') !== -1) {
    return {
      title: 'Malformed period',
      description: `Period is negative.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.bad_contract_parameter') !== -1) {
    return {
      title: 'Contract supplied an invalid parameter',
      description: `Either no parameter was supplied to a contract with a non-unit`
    }
  }

  if (operationError.id.indexOf('michelson_v1.bad_return') !== -1) {
    return {
      title: 'Bad return',
      description: `Unexpected stack at the end of a lambda or script.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.bad_stack') !== -1) {
    return {
      title: 'Bad stack',
      description: `The stack has an unexpected length or contents.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.bad_stack_item') !== -1) {
    return {
      title: 'Bad stack item',
      description: `The type of a stack item is unexpected (this error is always`
    }
  }

  if (operationError.id.indexOf('michelson_v1.cannot_serialize_error') !== -1) {
    return {
      title: 'Not enough gas to serialize error',
      description: `The error was too big to be serialized with the provided gas`
    }
  }

  if (operationError.id.indexOf('michelson_v1.cannot_serialize_failure') !== -1) {
    return {
      title: 'Not enough gas to serialize argument of FAILWITH',
      description: `Argument of FAILWITH was too big to be serialized with the provided`
    }
  }

  if (operationError.id.indexOf('michelson_v1.cannot_serialize_log') !== -1) {
    return {
      title: 'Not enough gas to serialize execution trace',
      description: `Execution trace with stacks was to big to be serialized with the`
    }
  }

  if (operationError.id.indexOf('michelson_v1.cannot_serialize_storage') !== -1) {
    return {
      title: 'Not enough gas to serialize execution storage',
      description: `The returned storage was too big to be serialized with the provided`
    }
  }

  if (operationError.id.indexOf('michelson_v1.comparable_type_expected') !== -1) {
    return {
      title: 'Comparable type expected',
      description: `A non comparable type was used in a place where only comparable`
    }
  }

  if (operationError.id.indexOf('michelson_v1.deprecated_instruction') !== -1) {
    return {
      title: 'Script is using a deprecated instruction',
      description: `A deprecated instruction usage is disallowed in newly created`
    }
  }

  if (operationError.id.indexOf('michelson_v1.duplicate_entrypoint') !== -1) {
    return {
      title: 'Duplicate entrypoint (type error)',
      description: `Two entrypoints have the same name.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.duplicate_map_keys') !== -1) {
    return {
      title: 'Duplicate map keys',
      description: `Map literals cannot contain duplicated keys`
    }
  }

  if (operationError.id.indexOf('michelson_v1.duplicate_script_field') !== -1) {
    return {
      title: 'Script has a duplicated field (parse error)',
      description: `When parsing script, a field was found more than once`
    }
  }

  if (operationError.id.indexOf('michelson_v1.duplicate_set_values_in_literal') !== -1) {
    return {
      title: 'Sets literals cannot contain duplicate elements',
      description: `Set literals cannot contain duplicate elements, but a duplicae was`
    }
  }

  if (operationError.id.indexOf('michelson_v1.entrypoint_name_too_long') !== -1) {
    return {
      title: 'Entrypoint name too long (type error)',
      description: `An entrypoint name exceeds the maximum length of 31 characters.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.fail_not_in_tail_position') !== -1) {
    return {
      title: 'FAIL not in tail position',
      description: `There is non trivial garbage code after a FAIL instruction.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.ill_formed_type') !== -1) {
    return {
      title: 'Ill formed type',
      description: `The toplevel error thrown when trying to parse a type expression`
    }
  }

  if (operationError.id.indexOf('michelson_v1.ill_typed_contract') !== -1) {
    return {
      title: 'Ill typed contract',
      description: `The toplevel error thrown when trying to typecheck a contract code`
    }
  }

  if (operationError.id.indexOf('michelson_v1.ill_typed_data') !== -1) {
    return {
      title: 'Ill typed data',
      description: `The toplevel error thrown when trying to typecheck a data expression`
    }
  }

  if (operationError.id.indexOf('michelson_v1.inconsistent_annotations') !== -1) {
    return {
      title: 'Annotations inconsistent between branches',
      description: `The annotations on two types could not be merged`
    }
  }

  if (operationError.id.indexOf('michelson_v1.inconsistent_field_annotations') !== -1) {
    return {
      title: 'Annotations for field accesses is inconsistent',
      description: `The specified field does not match the field annotation in the type`
    }
  }

  if (operationError.id.indexOf('michelson_v1.inconsistent_stack_lengths') !== -1) {
    return {
      title: 'Inconsistent stack lengths',
      description: `A stack was of an unexpected length (this error is always in the`
    }
  }

  if (operationError.id.indexOf('michelson_v1.inconsistent_type_annotations') !== -1) {
    return {
      title: 'Types contain inconsistent annotations',
      description: `The two types contain annotations that do not match`
    }
  }

  if (operationError.id.indexOf('michelson_v1.inconsistent_types') !== -1) {
    return {
      title: 'Inconsistent types',
      description: `This is the basic type clash error, that appears in several places`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_arity') !== -1) {
    return {
      title: 'Invalid arity',
      description: `In a script or data expression, a primitive was applied to an`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_big_map') !== -1) {
    return {
      title: 'Invalid big_map',
      description: `A script or data expression references a big_map that does not exist`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_constant') !== -1) {
    return {
      title: 'Invalid constant',
      description: `A data expression was invalid for its expected type.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_contract') !== -1) {
    return {
      title: 'Invalid contract',
      description: `A script or data expression references a contract that does not`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_expression_kind') !== -1) {
    return {
      title: 'Invalid expression kind',
      description: `In a script or data expression, an expression was of the wrong kind`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_iter_body') !== -1) {
    return {
      title: 'ITER body returned wrong stack type',
      description: `The body of an ITER instruction must result in the same stack type`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_map_block_fail') !== -1) {
    return {
      title: 'FAIL instruction occurred as body of map block',
      description: `FAIL cannot be the only instruction in the body. The propper type of`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_map_body') !== -1) {
    return {
      title: 'Invalid map body',
      description: `The body of a map block did not match the expected type`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_primitive') !== -1) {
    return {
      title: 'Invalid primitive',
      description: `In a script or data expression, a primitive was unknown.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_primitive_name') !== -1) {
    return {
      title: 'Invalid primitive name',
      description: `In a script or data expression, a primitive name is unknown or has a`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_primitive_name_case') !== -1) {
    return {
      title: 'Invalid primitive name case',
      description: `In a script or data expression, a primitive name is neither`
    }
  }

  if (operationError.id.indexOf('michelson_v1.invalid_primitive_namespace') !== -1) {
    return {
      title: 'Invalid primitive namespace',
      description: `In a script or data expression, a primitive was of the wrong`
    }
  }

  if (operationError.id.indexOf('michelson_v1.missing_script_field') !== -1) {
    return {
      title: 'Script is missing a field (parse error)',
      description: `When parsing script, a field was expected, but not provided`
    }
  }

  if (operationError.id.indexOf('michelson_v1.no_such_entrypoint') !== -1) {
    return {
      title: 'No such entrypoint (type error)',
      description: `An entrypoint was not found when calling a `
    }
  }

  if (operationError.id.indexOf('michelson_v1.runtime_error') !== -1) {
    return {
      title: 'Script runtime error',
      description: `Toplevel error for all runtime script errors`
    }
  }

  if (operationError.id.indexOf('michelson_v1.script_overflow') !== -1) {
    return {
      title: 'Script failed (overflow error)',
      description: `A FAIL instruction was reached due to the detection of an overflow`
    }
  }

  if (operationError.id.indexOf('michelson_v1.script_rejected') !== -1) {
    return {
      title: 'Script failed',
      description: `A FAILWITH instruction was reached`
    }
  }

  if (operationError.id.indexOf('michelson_v1.self_in_lambda') !== -1) {
    return {
      title: 'SELF instruction in lambda',
      description: `A SELF instruction was encountered in a lambda expression.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.type_too_large') !== -1) {
    return {
      title: 'Stack item type too large',
      description: `An instruction generated a type larger than the limit.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.undefined_binop') !== -1) {
    return {
      title: 'Undefined binop',
      description: `A binary operation is called on operands of types over which it is`
    }
  }

  if (operationError.id.indexOf('michelson_v1.undefined_unop') !== -1) {
    return {
      title: 'Undefined unop',
      description: `A unary operation is called on an operand of type over which it is`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unexpected_annotation') !== -1) {
    return {
      title: 'An annotation was encountered where no annotation is expected',
      description: `A node in the syntax tree was impropperly annotated`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unexpected_bigmap') !== -1) {
    return {
      title: 'Big map in unauthorized position (type error)',
      description: `When parsing script, a big_map type was found in a position where it`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unexpected_contract') !== -1) {
    return {
      title: 'Contract in unauthorized position (type error)',
      description: `When parsing script, a contract type was found in the storage or`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unexpected_operation') !== -1) {
    return {
      title: 'Operation in unauthorized position (type error)',
      description: `When parsing script, an operation type was found in the storage or`
    }
  }

  if (operationError.id.indexOf('michelson_v1.ungrouped_annotations') !== -1) {
    return {
      title: 'Annotations of the same kind were found spread apart',
      description: `Annotations of the same kind must be grouped`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unknown_primitive_name') !== -1) {
    return {
      title: 'Unknown primitive name',
      description: `In a script or data expression, a primitive was unknown.`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unmatched_branches') !== -1) {
    return {
      title: 'Unmatched branches',
      description: `At the join point at the end of two code branches the stacks have`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unordered_map_literal') !== -1) {
    return {
      title: 'Invalid map key order',
      description: `Map keys must be in strictly increasing order`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unordered_set_literal') !== -1) {
    return {
      title: 'Invalid set value order',
      description: `Set values must be in strictly increasing order`
    }
  }

  if (operationError.id.indexOf('michelson_v1.unreachable_entrypoint') !== -1) {
    return {
      title: 'Unreachable entrypoint (type error)',
      description: `An entrypoint in the contract is not reachable.`
    }
  }

  if (operationError.id.indexOf('nonce.previously_revealed') !== -1) {
    return {
      title: 'Previously revealed nonce',
      description: `Duplicated revelation for a nonce.`
    }
  }

  if (operationError.id.indexOf('nonce.too_early_revelation') !== -1) {
    return {
      title: 'Too early nonce revelation',
      description: `Nonce revelation happens before cycle end`
    }
  }

  if (operationError.id.indexOf('nonce.too_late_revelation') !== -1) {
    return {
      title: 'Too late nonce revelation',
      description: `Nonce revelation happens too late`
    }
  }

  if (operationError.id.indexOf('nonce.unexpected') !== -1) {
    return {
      title: 'Unexpected nonce',
      description: `The provided nonce is inconsistent with the committed nonce hash.`
    }
  }

  if (operationError.id.indexOf('operation.cannot_parse') !== -1) {
    return {
      title: 'Cannot parse operation',
      description: `The operation is ill-formed or for another protocol version`
    }
  }

  if (operationError.id.indexOf('operation.duplicate_endorsement') !== -1) {
    return {
      title: 'Duplicate endorsement',
      description: `Two endorsements received from same delegate`
    }
  }

  if (operationError.id.indexOf('operation.invalid_activation') !== -1) {
    return {
      title: 'Invalid activation',
      description: `The given key and secret do not correspond to any existing`
    }
  }

  if (operationError.id.indexOf('operation.invalid_endorsement_level') !== -1) {
    return {
      title: 'Unexpected level in endorsement',
      description: `The level of an endorsement is inconsistent with the  provided block`
    }
  }

  if (operationError.id.indexOf('operation.invalid_signature') !== -1) {
    return {
      title: 'Invalid operation signature',
      description: `The operation signature is ill-formed or has been made with the`
    }
  }

  if (operationError.id.indexOf('operation.missing_signature') !== -1) {
    return {
      title: 'Missing operation signature',
      description: `The operation is of a kind that must be signed, but the signature is`
    }
  }

  if (operationError.id.indexOf('operation.not_enought_endorsements_for_priority') !== -1) {
    return {
      title: 'Not enough endorsements for priority',
      description: `The block being validated does not include the required minimum`
    }
  }

  if (operationError.id.indexOf('operation.wrong_endorsement_predecessor') !== -1) {
    return {
      title: 'Wrong endorsement predecessor',
      description: `Trying to include an endorsement in a block that is not the`
    }
  }

  if (operationError.id.indexOf('operation.wrong_voting_period') !== -1) {
    return {
      title: 'Wrong voting period',
      description: `Trying to onclude a proposal or ballot meant for another voting`
    }
  }

  if (operationError.id.indexOf('seed.unknown_seed') !== -1) {
    return {
      title: 'Unknown seed',
      description: `The requested seed is not available`
    }
  }

  if (operationError.id.indexOf('storage_exhausted.operation') !== -1) {
    return {
      title: 'Storage quota exceeded for the operation',
      description: `A script or one of its callee wrote more bytes than the operation`
    }
  }

  if (operationError.id.indexOf('storage_limit_too_high') !== -1) {
    return {
      title: 'Storage limit out of protocol hard bounds',
      description: `A transaction tried to exceed the hard limit on storage`
    }
  }

  if (operationError.id.indexOf('tez.addition_overflow') !== -1) {
    return {
      title: 'Overflowing tez addition',
      description: `An addition of two tez amounts overflowed`
    }
  }

  if (operationError.id.indexOf('tez.invalid_divisor') !== -1) {
    return {
      title: 'Invalid tez divisor',
      description: `Multiplication of a tez amount by a non positive integer`
    }
  }

  if (operationError.id.indexOf('tez.multiplication_overflow') !== -1) {
    return {
      title: 'Overflowing tez multiplication',
      description: `A multiplication of a tez amount by an integer overflowed`
    }
  }

  if (operationError.id.indexOf('tez.negative_multiplicator') !== -1) {
    return {
      title: 'Negative tez multiplicator',
      description: `Multiplication of a tez amount by a negative integer`
    }
  }

  if (operationError.id.indexOf('tez.subtraction_underflow') !== -1) {
    return {
      title: 'Underflowing tez subtraction',
      description: `An subtraction of two tez amounts underflowed`
    }
  }

  if (operationError.id.indexOf('timestamp_add') !== -1) {
    return {
      title: 'Timestamp add',
      description: `Overflow when adding timestamps.`
    }
  }

  if (operationError.id.indexOf('timestamp_sub') !== -1) {
    return {
      title: 'Timestamp sub',
      description: `Substracting timestamps resulted in negative period.`
    }
  }

  if (operationError.id.indexOf('too_many_internal_operations') !== -1) {
    return {
      title: 'Too many internal operations',
      description: `A transaction exceeded the hard limit of internal operations it can`
    }
  }

  if (operationError.id.indexOf('too_many_proposals') !== -1) {
    return {
      title: 'Too many proposals',
      description: `The delegate reached the maximum number of allowed proposals.`
    }
  }

  if (operationError.id.indexOf('unauthorized_ballot') !== -1) {
    return {
      title: 'Unauthorized ballot',
      description: `The delegate provided for the ballot is not in the voting listings.`
    }
  }

  if (operationError.id.indexOf('unauthorized_proposal') !== -1) {
    return {
      title: 'Unauthorized proposal',
      description: `The delegate provided for the proposal is not in the voting`
    }
  }

  if (operationError.id.indexOf('undefined_operation_nonce') !== -1) {
    return {
      title: 'Ill timed access to the origination nonce',
      description: `An origination was attemped out of the scope of a manager operation`
    }
  }

  if (operationError.id.indexOf('unexpected_ballot') !== -1) {
    return {
      title: 'Unexpected ballot',
      description: `Ballot recorded outside of a voting period.`
    }
  }

  if (operationError.id.indexOf('unexpected_level') !== -1) {
    return {
      title: 'Unexpected level',
      description: `Level must be non-negative.`
    }
  }

  if (operationError.id.indexOf('unexpected_nonce_length') !== -1) {
    return {
      title: 'Unexpected nonce length',
      description: `Nonce length is incorrect.`
    }
  }

  if (operationError.id.indexOf('unexpected_proposal') !== -1) {
    return {
      title: 'Unexpected proposal',
      description: `Proposal recorded outside of a proposal period.`
    }
  }

  if (operationError.id.indexOf('node.bootstrap_pipeline.invalid_locator') !== -1) {
    return {
      title: 'Invalid block locator',
      description: `Block locator is invalid.`
    }
  }

  if (operationError.id.indexOf('node.bootstrap_pipeline.too_short_locator') !== -1) {
    return {
      title: 'Too short locator',
      description: `Block locator is too short.`
    }
  }

  if (operationError.id.indexOf('node.p2p_io_scheduler.connection_closed') !== -1) {
    return {
      title: 'Connection closed',
      description: `IO error: connection with a peer is closed.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.connected') !== -1) {
    return {
      title: 'Connected',
      description: `Fail to connect with a peer: a connection is already established.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.connection_refused') !== -1) {
    return {
      title: 'Connection refused',
      description: `Connection was refused.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.peer_banned') !== -1) {
    return {
      title: 'Peer Banned',
      description: `The peer identity you tried to connect is banned.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.pending_connection') !== -1) {
    return {
      title: 'Pending connection',
      description: `Fail to connect with a peer: a connection is already pending.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.point_banned') !== -1) {
    return {
      title: 'Point Banned',
      description: `The address you tried to connect is banned.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.private_mode') !== -1) {
    return {
      title: 'Private mode',
      description: `Node is in private mode.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.rejected') !== -1) {
    return {
      title: 'Rejected peer',
      description: `Connection to peer was rejected by us.`
    }
  }

  if (operationError.id.indexOf('node.p2p_pool.too_many_connections') !== -1) {
    return {
      title: 'Too many connections',
      description: `Too many connections.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.decipher_error') !== -1) {
    return {
      title: 'Decipher error',
      description: `An error occurred while deciphering.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.decoding_error') !== -1) {
    return {
      title: 'Decoding error',
      description: `An error occurred while decoding.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.encoding_error') !== -1) {
    return {
      title: 'Encoding error',
      description: `An error occurred while encoding.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.invalid_auth') !== -1) {
    return {
      title: 'Invalid authentication',
      description: `Rejected peer connection: invalid authentication.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.invalid_chunks_size') !== -1) {
    return {
      title: 'Invalid chunks size',
      description: `Size of chunks is not valid.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.invalid_incoming_ciphertext_size') !== -1) {
    return {
      title: 'Invalid incoming ciphertext size',
      description: `The announced size for the incoming ciphertext is invalid.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.invalid_message_size') !== -1) {
    return {
      title: 'Invalid message size',
      description: `The size of the message to be written is invalid.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.myself') !== -1) {
    return {
      title: 'Myself',
      description: `Remote peer is actually yourself.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.not_enough_proof_of_work') !== -1) {
    return {
      title: 'Not enough proof of work',
      description: `Remote peer cannot be authenticated: not enough proof of work.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.rejected_by_nack') !== -1) {
    return {
      title: 'Rejected socket connection by Nack',
      description: `Rejected peer connection: The peer rejected the socket connection by`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.rejected_no_common_protocol') !== -1) {
    return {
      title: 'Rejected socket connection - no common network protocol',
      description: `Rejected peer connection: rejected socket connection as we have no`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.rejected_socket_connection') !== -1) {
    return {
      title: 'Rejected socket connection',
      description: `Rejected peer connection: rejected socket connection.`
    }
  }

  if (operationError.id.indexOf('node.p2p_socket.rejecting_incoming') !== -1) {
    return {
      title: 'Rejecting socket connection',
      description: `Rejecting peer connection with motive.`
    }
  }

  if (operationError.id.indexOf('node.peer_validator.known_invalid') !== -1) {
    return {
      title: 'Known invalid',
      description: `Known invalid block found in the peer's chain`
    }
  }

  if (operationError.id.indexOf('node.peer_validator.unknown_ancestor') !== -1) {
    return {
      title: 'Unknown ancestor',
      description: `Unknown ancestor block found in the peer's chain`
    }
  }

  if (operationError.id.indexOf('node.prevalidation.future_block_header') !== -1) {
    return {
      title: 'Future block header',
      description: `The block was annotated with a time too far in the future.`
    }
  }

  if (operationError.id.indexOf('node.prevalidation.oversized_operation') !== -1) {
    return {
      title: 'Oversized operation',
      description: `The operation size is bigger than allowed.`
    }
  }

  if (operationError.id.indexOf('node.prevalidation.parse_error') !== -1) {
    return {
      title: 'Parsing error in prevalidation',
      description: `Raised when an operation has not been parsed correctly during`
    }
  }

  if (operationError.id.indexOf('node.prevalidation.too_many_operations') !== -1) {
    return {
      title: 'Too many pending operations in prevalidation',
      description: `The prevalidation context is full.`
    }
  }

  if (operationError.id.indexOf('node.state.bad_data_dir') !== -1) {
    return {
      title: 'Bad data directory',
      description: `The data directory could not be read. This could be because it was`
    }
  }

  if (operationError.id.indexOf('node.state.block.inconsistent_context_hash') !== -1) {
    return {
      title: 'Inconsistent commit hash',
      description: `When committing the context of a block, the announced context hash`
    }
  }

  if (operationError.id.indexOf('node.state.block_not_invalid') !== -1) {
    return {
      title: 'Block not invalid',
      description: `The invalid block to be unmarked was not actually invalid.`
    }
  }

  if (operationError.id.indexOf('node.state.unknown_chain') !== -1) {
    return {
      title: 'Unknown chain',
      description: `The chain identifier could not be found in the chain identifiers`
    }
  }

  if (operationError.id.indexOf('node.validator.checkpoint_error') !== -1) {
    return {
      title: 'Block incompatible with the current checkpoint.',
      description: `The block belongs to a branch that is not compatible with the`
    }
  }

  if (operationError.id.indexOf('node.validator.inactive_chain') !== -1) {
    return {
      title: 'Inactive chain',
      description: `Attempted validation of a block from an inactive chain.`
    }
  }

  if (operationError.id.indexOf('node_config_file.incorrect_history_mode_switch') !== -1) {
    return {
      title: 'Incorrect history mode switch',
      description: `Incorrect history mode switch.`
    }
  }

  if (operationError.id.indexOf('raw_store.unknown') !== -1) {
    return {
      title: 'Missing key in store',
      description: `Missing key in store`
    }
  }

  if (operationError.id.indexOf('validator.inconsistent_operations_hash') !== -1) {
    return {
      title: 'Invalid merkle tree',
      description: `The provided list of operations is inconsistent with the block`
    }
  }

  if (operationError.id.indexOf('validator.missing_test_protocol') !== -1) {
    return {
      title: 'Missing test protocol',
      description: `Missing test protocol when forking the test chain`
    }
  }

  if (operationError.id.indexOf('validator.unavailable_protocol') !== -1) {
    return {
      title: 'Missing protocol',
      description: `The protocol required for validating a block is missing.`
    }
  }

  if (operationError.id.indexOf('validator.validation_process_failed') !== -1) {
    return {
      title: 'Validation process failed',
      description: `Failed to validate block using external validation process.`
    }
  }

  if (operationError.id.indexOf('worker.closed') !== -1) {
    return {
      title: 'Worker closed',
      description: `An operation on a worker could not complete before it was shut down.`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.annotation_exceeds_max_length') !== -1) {
    return {
      title: 'Micheline parser error: annotation exceeds max length',
      description: `While parsing a piece of Micheline source, an annotation exceeded`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.empty_expression') !== -1) {
    return {
      title: 'Micheline parser error: empty_expression',
      description: `Tried to interpret an empty piece or Micheline source as a single`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.extra_token') !== -1) {
    return {
      title: 'Micheline parser error: extra token',
      description: `While parsing a piece of Micheline source, an extra semi colon or`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.invalid_utf8_sequence') !== -1) {
    return {
      title: 'Micheline parser error: invalid UTF-8 sequence',
      description: `While parsing a piece of Micheline source, a sequence of bytes that`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.misaligned_node') !== -1) {
    return {
      title: 'Micheline parser error: misaligned node',
      description: `While parsing a piece of Micheline source, an expression was not`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.missing_break_after_number') !== -1) {
    return {
      title: 'Micheline parser error: missing break after number',
      description: `While parsing a piece of Micheline source, a number was not visually`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.odd_lengthed_bytes') !== -1) {
    return {
      title: 'Micheline parser error: odd lengthed bytes',
      description: `While parsing a piece of Micheline source, the length of a byte`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.unclosed_token') !== -1) {
    return {
      title: 'Micheline parser error: unclosed token',
      description: `While parsing a piece of Micheline source, a parenthesis or a brace`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.undefined_escape_sequence') !== -1) {
    return {
      title: 'Micheline parser error: undefined escape sequence',
      description: `While parsing a piece of Micheline source, an unexpected escape`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.unexpected_character') !== -1) {
    return {
      title: 'Micheline parser error: unexpected character',
      description: `While parsing a piece of Micheline source, an unexpected character`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.unexpected_token') !== -1) {
    return {
      title: 'Micheline parser error: unexpected token',
      description: `While parsing a piece of Micheline source, an unexpected token was`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.unterminated_comment') !== -1) {
    return {
      title: 'Micheline parser error: unterminated comment',
      description: `While parsing a piece of Micheline source, a commentX was not`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.unterminated_integer') !== -1) {
    return {
      title: 'Micheline parser error: unterminated integer',
      description: `While parsing a piece of Micheline source, an integer was not`
    }
  }

  if (operationError.id.indexOf('micheline.parse_error.unterminated_string') !== -1) {
    return {
      title: 'Micheline parser error: unterminated string',
      description: `While parsing a piece of Micheline source, a string was not`
    }
  }

  if (operationError.id.indexOf('rpc_client.request_failed') !== -1) {
    return {
      title: '',
      description: ``
    }
  }

  if (operationError.id.indexOf('Bad_hash') !== -1) {
    return {
      title: 'Bad hash',
      description: `Wrong hash given`
    }
  }

  if (operationError.id.indexOf('Block_validator_process.failed_to_checkout_context') !== -1) {
    return {
      title: 'Fail during checkout context',
      description: `The context checkout failed using a given hash`
    }
  }

  if (operationError.id.indexOf('Block_validator_process.failed_to_get_live_block') !== -1) {
    return {
      title: 'Fail to get live blocks',
      description: `Unable to get live blocks from a given hash`
    }
  }

  if (operationError.id.indexOf('CannotReconstruct') !== -1) {
    return {
      title: 'Cannot reconstruct',
      description: `Cannot reconstruct`
    }
  }

  if (operationError.id.indexOf('Context_not_found') !== -1) {
    return {
      title: 'Context not found',
      description: `Cannot find context corresponding to hash`
    }
  }

  if (operationError.id.indexOf('InconsistentImportedBlock') !== -1) {
    return {
      title: 'Inconsistent imported block',
      description: `The imported block is not the expected one.`
    }
  }

  if (operationError.id.indexOf('InconsistentOperationHashes') !== -1) {
    return {
      title: 'Inconsistent operation hashes',
      description: `The operations given do not match their hashes.`
    }
  }

  if (operationError.id.indexOf('Inconsistent_snapshot_data') !== -1) {
    return {
      title: 'Inconsistent snapshot data',
      description: `The data provided by the snapshot is inconsistent`
    }
  }

  if (operationError.id.indexOf('Inconsistent_snapshot_file') !== -1) {
    return {
      title: 'Inconsistent snapshot file',
      description: `Error while opening snapshot file`
    }
  }

  if (operationError.id.indexOf('InvalidBlockSpecification') !== -1) {
    return {
      title: 'Invalid block specification',
      description: `Invalid specification of block to import`
    }
  }

  if (operationError.id.indexOf('Invalid_snapshot_version') !== -1) {
    return {
      title: 'Invalid snapshot version',
      description: `The version of the snapshot to import is not valid`
    }
  }

  if (operationError.id.indexOf('Missing_snapshot_data') !== -1) {
    return {
      title: 'Missing data in imported snapshot',
      description: `Mandatory data missing while reaching end of snapshot file.`
    }
  }

  if (operationError.id.indexOf('RPC.Unexpected_error_encoding') !== -1) {
    return {
      title: 'RPC fails with an unparsable error message',
      description: `The RPC returned with an error code, and the associated body was not`
    }
  }

  if (operationError.id.indexOf('RPC_context.Gone') !== -1) {
    return {
      title: 'RPC lookup failed because of deleted data',
      description: `RPC lookup failed. Block has been pruned and requested data deleted.`
    }
  }

  if (operationError.id.indexOf('RPC_context.Not_found') !== -1) {
    return {
      title: 'RPC lookup failed',
      description: `RPC lookup failed. No RPC exists at the URL or the RPC tried to`
    }
  }

  if (operationError.id.indexOf('Restore_context_failure') !== -1) {
    return {
      title: 'Failed to restore context',
      description: `Internal error while restoring the context`
    }
  }

  if (operationError.id.indexOf('SnapshotImportFailure') !== -1) {
    return {
      title: 'Snapshot import failure',
      description: `The imported snapshot is malformed.`
    }
  }

  if (operationError.id.indexOf('System_read_error') !== -1) {
    return {
      title: 'System read error',
      description: `Failed to read file`
    }
  }

  if (operationError.id.indexOf('Validator_process.system_error_while_validating') !== -1) {
    return {
      title: 'Failed to validate block because of a system error',
      description: `The validator failed because of a system error`
    }
  }

  if (operationError.id.indexOf('Writing_error') !== -1) {
    return {
      title: 'Writing error',
      description: `Cannot write in file for context dump`
    }
  }

  if (operationError.id.indexOf('WrongBlockExport') !== -1) {
    return {
      title: 'Wrong block export',
      description: `The block to export in the snapshot is not valid.`
    }
  }

  if (operationError.id.indexOf('WrongProtocolHash') !== -1) {
    return {
      title: 'Wrong protocol hash',
      description: `Wrong protocol hash`
    }
  }

  if (operationError.id.indexOf('WrongSnapshotExport') !== -1) {
    return {
      title: 'Wrong snapshot export',
      description: `Snapshot exports is not compatible with the current configuration.`
    }
  }

  if (operationError.id.indexOf('assertion') !== -1) {
    return {
      title: 'Assertion failure',
      description: `A fatal assertion failed`
    }
  }

  if (operationError.id.indexOf('block_validation.cannot_serialize_metadata') !== -1) {
    return {
      title: 'Cannot serialize metadata',
      description: `Unable to serialize metadata`
    }
  }

  if (operationError.id.indexOf('canceled') !== -1) {
    return {
      title: 'Canceled',
      description: `A promise was unexpectedly canceled`
    }
  }

  if (operationError.id.indexOf('cli.key.invalid_uri') !== -1) {
    return {
      title: 'Invalid key uri',
      description: `A key has been provided with an invalid uri.`
    }
  }

  if (operationError.id.indexOf('cli.signature_mismatch') !== -1) {
    return {
      title: 'Signature mismatch',
      description: `The signer produced an invalid signature`
    }
  }

  if (operationError.id.indexOf('cli.unregistered_key_scheme') !== -1) {
    return {
      title: 'Unregistered key scheme',
      description: `A key has been provided with an unregistered scheme (no`
    }
  }

  if (operationError.id.indexOf('client.alpha.Bad deserialized counter') !== -1) {
    return {
      title: 'Deserialized counter does not match the stored one',
      description: `The byte sequence references a multisig counter that does not match`
    }
  }

  if (operationError.id.indexOf('client.alpha.actionDeserialisation') !== -1) {
    return {
      title: 'The expression is not a valid multisig action',
      description: `When trying to deserialise an action from a sequence of bytes, we`
    }
  }

  if (operationError.id.indexOf('client.alpha.badDeserializedContract') !== -1) {
    return {
      title: 'The byte sequence is not for the given multisig contract',
      description: `When trying to deserialise an action from a sequence of bytes, we`
    }
  }

  if (operationError.id.indexOf('client.alpha.badEndorsementDelayArg') !== -1) {
    return {
      title: 'Bad -endorsement-delay arg',
      description: `invalid duration in -endorsement-delay`
    }
  }

  if (operationError.id.indexOf('client.alpha.badMaxPriorityArg') !== -1) {
    return {
      title: 'Bad -max-priority arg',
      description: `invalid priority in -max-priority`
    }
  }

  if (operationError.id.indexOf('client.alpha.badMaxWaitingTimeArg') !== -1) {
    return {
      title: 'Bad -max-waiting-time arg',
      description: `invalid duration in -max-waiting-time`
    }
  }

  if (operationError.id.indexOf('client.alpha.badMinimalFeesArg') !== -1) {
    return {
      title: 'Bad -minimal-fees arg',
      description: `invalid fee threshold in -fee-threshold`
    }
  }

  if (operationError.id.indexOf('client.alpha.badPreservedLevelsArg') !== -1) {
    return {
      title: 'Bad -preserved-levels arg',
      description: `invalid number of levels in -preserved-levels`
    }
  }

  if (operationError.id.indexOf('client.alpha.badTezArg') !== -1) {
    return {
      title: 'Bad Tez Arg',
      description: `Invalid ꜩ notation in parameter.`
    }
  }

  if (operationError.id.indexOf('client.alpha.bytesDeserialisation') !== -1) {
    return {
      title: 'The byte sequence is not a valid multisig action',
      description: `When trying to deserialise an action from a sequence of bytes, we`
    }
  }

  if (operationError.id.indexOf('client.alpha.contractHasNoScript') !== -1) {
    return {
      title: 'The given contract is not a multisig contract because it has no',
      description: `script`
    }
  }

  if (operationError.id.indexOf('client.alpha.contractHasNoStorage') !== -1) {
    return {
      title: 'The given contract is not a multisig contract because it has no',
      description: `storage`
    }
  }

  if (operationError.id.indexOf('client.alpha.contractHasUnexpectedStorage') !== -1) {
    return {
      title: 'The storage of the given contract is not of the shape expected for a',
      description: `multisig contract`
    }
  }

  if (operationError.id.indexOf('client.alpha.contractWithoutCode') !== -1) {
    return {
      title: 'The given contract has no code',
      description: `Attempt to get the code of a contract failed because it has nocode.`
    }
  }

  if (operationError.id.indexOf('client.alpha.invalidSignature') !== -1) {
    return {
      title: 'The following signature did not match a public key in the given',
      description: `multisig contract`
    }
  }

  if (operationError.id.indexOf('client.alpha.michelson.macros.bas_arity') !== -1) {
    return {
      title: 'Wrong number of arguments to macro',
      description: `A wrong number of arguments was provided to a macro`
    }
  }

  if (operationError.id.indexOf('client.alpha.michelson.macros.sequence_expected') !== -1) {
    return {
      title: 'Macro expects a sequence',
      description: `An macro expects a sequence, but a sequence was not provided`
    }
  }

  if (operationError.id.indexOf('client.alpha.michelson.macros.unexpected_annotation') !== -1) {
    return {
      title: 'Unexpected annotation',
      description: `A macro had an annotation, but no annotation was permitted on this`
    }
  }

  if (operationError.id.indexOf('client.alpha.nonPositiveThreshold') !== -1) {
    return {
      title: 'Given threshold is not positive',
      description: `A multisig threshold should be a positive number`
    }
  }

  if (operationError.id.indexOf('client.alpha.notASupportedMultisigContract') !== -1) {
    return {
      title: 'The given contract is not one of the supported contracts',
      description: `A multisig command has referenced a smart contract whose script is`
    }
  }

  if (operationError.id.indexOf('client.alpha.notEnoughSignatures') !== -1) {
    return {
      title: 'Not enough signatures were provided for this multisig action',
      description: `To run an action on a multisig contract, you should provide at least`
    }
  }

  if (operationError.id.indexOf('client.alpha.thresholdTooHigh') !== -1) {
    return {
      title: 'Given threshold is too high',
      description: `The given threshold is higher than the number of keys, this would`
    }
  }

  if (operationError.id.indexOf('context.non_recoverable_context') !== -1) {
    return {
      title: 'Non recoverable context',
      description: `Cannot recover from a corrupted context.`
    }
  }

  if (operationError.id.indexOf('context_dump.read.cannot_open') !== -1) {
    return {
      title: 'Cannot open file for context restoring',
      description: ``
    }
  }

  if (operationError.id.indexOf('context_dump.read.suspicious') !== -1) {
    return {
      title: 'Suspicious file: data after end',
      description: ``
    }
  }

  if (operationError.id.indexOf('context_dump.write.cannot_open') !== -1) {
    return {
      title: 'Cannot open file for context dump',
      description: ``
    }
  }

  if (operationError.id.indexOf('failure') !== -1) {
    return {
      title: 'Exception',
      description: `Exception safely wrapped in an error`
    }
  }

  if (operationError.id.indexOf('raw_context.invalid_depth') !== -1) {
    return {
      title: 'Invalid depth argument',
      description: `The raw context extraction depth argument must be positive.`
    }
  }

  if (operationError.id.indexOf('registered_protocol.unregistered_protocol') !== -1) {
    return {
      title: 'Unregistered protocol',
      description: `No protocol was registered with the requested hash.`
    }
  }

  if (operationError.id.indexOf('requester.Operation_hash.fetch_canceled') !== -1) {
    return {
      title: 'Canceled fetch of a Operation_hash',
      description: `The fetch of a Operation_hash has been canceled`
    }
  }

  if (operationError.id.indexOf('requester.Operation_hash.fetch_timeout') !== -1) {
    return {
      title: 'Timed out fetch of a Operation_hash',
      description: `The fetch of a Operation_hash has timed out`
    }
  }

  if (operationError.id.indexOf('requester.Operation_hash.missing') !== -1) {
    return {
      title: 'Missing Operation_hash',
      description: `Some Operation_hash is missing from the requester`
    }
  }

  if (operationError.id.indexOf('requester.Protocol_hash.fetch_canceled') !== -1) {
    return {
      title: 'Canceled fetch of a Protocol_hash',
      description: `The fetch of a Protocol_hash has been canceled`
    }
  }

  if (operationError.id.indexOf('requester.Protocol_hash.fetch_timeout') !== -1) {
    return {
      title: 'Timed out fetch of a Protocol_hash',
      description: `The fetch of a Protocol_hash has timed out`
    }
  }

  if (operationError.id.indexOf('requester.Protocol_hash.missing') !== -1) {
    return {
      title: 'Missing Protocol_hash',
      description: `Some Protocol_hash is missing from the requester`
    }
  }

  if (operationError.id.indexOf('requester.block_hash.fetch_canceled') !== -1) {
    return {
      title: 'Canceled fetch of a block_hash',
      description: `The fetch of a block_hash has been canceled`
    }
  }

  if (operationError.id.indexOf('requester.block_hash.fetch_timeout') !== -1) {
    return {
      title: 'Timed out fetch of a block_hash',
      description: `The fetch of a block_hash has timed out`
    }
  }

  if (operationError.id.indexOf('requester.block_hash.missing') !== -1) {
    return {
      title: 'Missing block_hash',
      description: `Some block_hash is missing from the requester`
    }
  }

  if (operationError.id.indexOf('requester.operations.fetch_canceled') !== -1) {
    return {
      title: 'Canceled fetch of a operations',
      description: `The fetch of a operations has been canceled`
    }
  }

  if (operationError.id.indexOf('requester.operations.fetch_timeout') !== -1) {
    return {
      title: 'Timed out fetch of a operations',
      description: `The fetch of a operations has timed out`
    }
  }

  if (operationError.id.indexOf('requester.operations.missing') !== -1) {
    return {
      title: 'Missing operations',
      description: `Some operations is missing from the requester`
    }
  }

  if (operationError.id.indexOf('signer.decoding_error') !== -1) {
    return {
      title: 'Decoding_error',
      description: `Error while decoding a remote signer message`
    }
  }

  if (operationError.id.indexOf('signer.encoding_error') !== -1) {
    return {
      title: 'Encoding_error',
      description: `Error while encoding a remote signer message`
    }
  }

  if (operationError.id.indexOf('state.block.contents_not_found') !== -1) {
    return {
      title: 'Block_contents_not_found',
      description: `Block not found`
    }
  }

  if (operationError.id.indexOf('state.block.not_found') !== -1) {
    return {
      title: 'Block_not_found',
      description: `Block not found`
    }
  }

  if (operationError.id.indexOf('unix.system_info') !== -1) {
    return {
      title: 'Unix System_info failure',
      description: `Unix System_info failure`
    }
  }

  if (operationError.id.indexOf('unix_error') !== -1) {
    return {
      title: 'Unix error',
      description: `An unhandled unix exception`
    }
  }

  if (operationError.id.indexOf('utils.Canceled') !== -1) {
    return {
      title: 'Canceled',
      description: `Canceled`
    }
  }

  if (operationError.id.indexOf('utils.Timeout') !== -1) {
    return {
      title: 'Timeout',
      description: `Timeout`
    }
  }

  return {
    title: operationError.id,
    description: undefined
  }
}

export const getTransactionsWithErrors = (
  operationErrorsById: OperationErrorsById[],
  tableState: TableState<Transaction>
): TableState<Transaction> => ({
  ...tableState,
  data: tableState.data.map(transaction => {
    const match = operationErrorsById.find(error => error.id === transaction.operation_group_hash)

    return {
      ...transaction,
      errors: match ? match.errors : null
    }
  })
})
