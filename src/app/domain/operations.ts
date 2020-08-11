import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { TableState } from '@tezblock/domain/table'

// TODO: refactor this enum: exclude page ids from entity types..
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
  Rewards = 'rewards',
  DoubleBakingEvidenceOverview = 'double_baking_evidence_overview',
  DoubleEndorsementEvidenceOverview = 'double_endorsement_evidence_overview',
  BakerOverview = 'baker_overview',
  ProposalOverview = 'proposal_overview',

  // these are not operation types...
  Block = 'block',
  TokenContract = 'token contract',
  Contract = 'contract',
  Account = 'account',
  Baker = 'baker'
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

const ErrorDescriptions = new Map()

ErrorDescriptions.set('assertion', {
  title: 'Assertion failure',
  description: `A fatal assertion failed`
})

ErrorDescriptions.set('baking.insufficient_proof_of_work', {
  title: 'Insufficient block proof-of-work stamp',
  description: `The block's proof-of-work stamp is insufficient`
})

ErrorDescriptions.set('baking.invalid_block_signature', {
  title: 'Invalid block signature',
  description: `A block was not signed with the expected private key.`
})

ErrorDescriptions.set('baking.invalid_fitness_gap', {
  title: 'Invalid fitness gap',
  description: `The gap of fitness is out of bounds`
})

ErrorDescriptions.set('baking.invalid_signature', {
  title: 'Invalid block signature',
  description: `The block's signature is invalid`
})

ErrorDescriptions.set('baking.timestamp_too_early', {
  title: 'Block forged too early',
  description: `The block timestamp is before the first slot for this baker at this`
})

ErrorDescriptions.set('baking.unexpected_endorsement', {
  title: 'Endorsement from unexpected delegate',
  description: `The operation is signed by a delegate without endorsement rights.`
})

ErrorDescriptions.set('block.inconsistent_double_baking_evidence', {
  title: 'Inconsistent double baking evidence',
  description: `A double-baking evidence is inconsistent  (two distinct delegates)`
})

ErrorDescriptions.set('block.inconsistent_double_endorsement_evidence', {
  title: 'Inconsistent double endorsement evidence',
  description: `A double-endorsement evidence is inconsistent  (two distinct`
})

ErrorDescriptions.set('block.invalid_commitment', {
  title: 'Invalid commitment in block header',
  description: `The block header has invalid commitment.`
})

ErrorDescriptions.set('block.invalid_double_baking_evidence', {
  title: 'Invalid double baking evidence',
  description: `A double-baking evidence is inconsistent  (two distinct level)`
})

ErrorDescriptions.set('block.invalid_double_endorsement_evidence', {
  title: 'Invalid double endorsement evidence',
  description: `A double-endorsement evidence is malformed`
})

ErrorDescriptions.set('block.multiple_revelation', {
  title: 'Multiple revelations were included in a manager operation',
  description: `A manager operation should not contain more than one revelation`
})

ErrorDescriptions.set('block.outdated_double_baking_evidence', {
  title: 'Outdated double baking evidence',
  description: `A double-baking evidence is outdated.`
})

ErrorDescriptions.set('block.outdated_double_endorsement_evidence', {
  title: 'Outdated double endorsement evidence',
  description: `A double-endorsement evidence is outdated.`
})

ErrorDescriptions.set('block.too_early_double_baking_evidence', {
  title: 'Too early double baking evidence',
  description: `A double-baking evidence is in the future`
})

ErrorDescriptions.set('block.too_early_double_endorsement_evidence', {
  title: 'Too early double endorsement evidence',
  description: `A double-endorsement evidence is in the future`
})

ErrorDescriptions.set('block.unrequired_double_baking_evidence', {
  title: 'Unrequired double baking evidence',
  description: `A double-baking evidence is unrequired`
})

ErrorDescriptions.set('block.unrequired_double_endorsement_evidence', {
  title: 'Unrequired double endorsement evidence',
  description: `A double-endorsement evidence is unrequired`
})

ErrorDescriptions.set('context.failed_to_decode_parameter', {
  title: 'Failed to decode parameter',
  description: `Unexpected JSON object.`
})

ErrorDescriptions.set('context.failed_to_parse_parameter', {
  title: 'Failed to parse parameter',
  description: `The protocol parameters are not valid JSON.`
})

ErrorDescriptions.set('contract.balance_too_low', {
  title: 'Balance too low',
  description: `An operation tried to spend more tokens than the contract has`
})

ErrorDescriptions.set('contract.cannot_pay_storage_fee', {
  title: 'Cannot pay storage fee',
  description: `The storage fee is higher than the contract balance`
})

ErrorDescriptions.set('contract.counter_in_the_future', {
  title: 'Invalid counter (not yet reached) in a manager operation',
  description: `An operation assumed a contract counter in the future`
})

ErrorDescriptions.set('contract.counter_in_the_past', {
  title: 'Invalid counter (already used) in a manager operation',
  description: `An operation assumed a contract counter in the past`
})

ErrorDescriptions.set('contract.empty_transaction', {
  title: 'Empty transaction',
  description: `Forbidden to credit 0ꜩ to a contract without code.`
})

ErrorDescriptions.set('contract.failure', {
  title: 'Contract storage failure',
  description: `Unexpected contract storage error`
})

ErrorDescriptions.set('contract.invalid_contract_notation', {
  title: 'Invalid contract notation',
  description: `A malformed contract notation was given to an RPC or in a script.`
})

ErrorDescriptions.set('contract.manager.consume_roll_change', {
  title: 'Consume roll change',
  description: `Change is not enough to consume a roll.`
})

ErrorDescriptions.set('contract.manager.inconsistent_hash', {
  title: 'Inconsistent public key hash',
  description: `A revealed manager public key is inconsistent with the announced`
})

ErrorDescriptions.set('contract.manager.inconsistent_public_key', {
  title: 'Inconsistent public key',
  description: `A provided manager public key is different with the public key`
})

ErrorDescriptions.set('contract.manager.no_roll_for_delegate', {
  title: 'No roll for delegate',
  description: `Delegate has no roll.`
})

ErrorDescriptions.set('contract.manager.no_roll_snapshot_for_cycle', {
  title: 'No roll snapshot for cycle',
  description: `A snapshot of the rolls distribution does not exist for this cycle.`
})

ErrorDescriptions.set('contract.manager.unregistered_delegate', {
  title: 'Unregistered delegate',
  description: `A contract cannot be delegated to an unregistered delegate`
})

ErrorDescriptions.set('contract.non_existing_contract', {
  title: 'Non existing contract',
  description: `A contract handle is not present in the context (either it never was`
})

ErrorDescriptions.set('contract.previously_revealed_key', {
  title: 'Manager operation already revealed',
  description: `One tried to revealed twice a manager public key`
})

ErrorDescriptions.set('contract.unrevealed_key', {
  title: 'Manager operation precedes key revelation',
  description: `One tried to apply a manager operation without revealing the manager`
})

ErrorDescriptions.set('contract.unspendable_contract', {
  title: 'Unspendable contract',
  description: `An operation tried to spend tokens from an unspendable contract`
})

ErrorDescriptions.set('delegate.already_active', {
  title: 'Delegate already active',
  description: `Useless delegate reactivation`
})

ErrorDescriptions.set('delegate.balance_too_low_for_deposit', {
  title: 'Balance too low for deposit',
  description: `Cannot freeze deposit when the balance is too low`
})

ErrorDescriptions.set('delegate.empty_delegate_account', {
  title: 'Empty delegate account',
  description: `Cannot register a delegate when its implicit account is empty`
})

ErrorDescriptions.set('delegate.no_deletion', {
  title: 'Forbidden delegate deletion',
  description: `Tried to unregister a delegate`
})

ErrorDescriptions.set('delegate.unchanged', {
  title: 'Unchanged delegated',
  description: `Contract already delegated to the given delegate`
})

ErrorDescriptions.set('empty_proposal', {
  title: 'Empty proposal',
  description: `Proposal lists cannot be empty.`
})

ErrorDescriptions.set('gas_exhausted.block', {
  title: 'Gas quota exceeded for the block',
  description: `The sum of gas consumed by all the operations in the block exceeds`
})

ErrorDescriptions.set('gas_exhausted.init_deserialize', {
  title: 'Not enough gas for initial deserialization of script expresions',
  description: `Gas limit was not high enough to deserialize the transaction`
})

ErrorDescriptions.set('gas_exhausted.operation', {
  title: 'Gas quota exceeded for the operation',
  description: `A script or one of its callee took more time than the operation said`
})

ErrorDescriptions.set('gas_limit_too_high', {
  title: 'Gas limit out of protocol hard bounds',
  description: `A transaction tried to exceed the hard limit on gas`
})

ErrorDescriptions.set('implicit.empty_implicit_contract', {
  title: 'Empty implicit contract',
  description: `No manager operations are allowed on an empty implicit contract.`
})

ErrorDescriptions.set('implicit.empty_implicit_delegated_contract', {
  title: 'Empty implicit delegated contract',
  description: `Emptying an implicit delegated account is not allowed.`
})

ErrorDescriptions.set('incorrect_number_of_endorsements', {
  title: 'Incorrect number of endorsements',
  description: `The number of endorsements must be non-negative and at most the`
})

ErrorDescriptions.set('incorrect_priority', {
  title: 'Incorrect priority',
  description: `Block priority must be non-negative.`
})

ErrorDescriptions.set('invalidSyntacticConstantError', {
  title: 'Invalid constant (parse error)',
  description: `A compile-time constant was invalid for its expected form.`
})

ErrorDescriptions.set('invalid_arg', {
  title: 'Invalid arg',
  description: `Negative multiple of periods are not allowed.`
})

ErrorDescriptions.set('invalid_binary_format', {
  title: 'Invalid binary format',
  description: `Could not deserialize some piece of data from its binary`
})

ErrorDescriptions.set('invalid_fitness', {
  title: 'Invalid fitness',
  description: `Fitness representation should be exactly 8 bytes long.`
})

ErrorDescriptions.set('invalid_proposal', {
  title: 'Invalid proposal',
  description: `Ballot provided for a proposal that is not the current one.`
})

ErrorDescriptions.set('malformed_period', {
  title: 'Malformed period',
  description: `Period is negative.`
})

ErrorDescriptions.set('michelson_v1.bad_contract_parameter', {
  title: 'Contract supplied an invalid parameter',
  description: `Either no parameter was supplied to a contract with a non-unit`
})

ErrorDescriptions.set('michelson_v1.bad_return', {
  title: 'Bad return',
  description: `Unexpected stack at the end of a lambda or script.`
})

ErrorDescriptions.set('michelson_v1.bad_stack', {
  title: 'Bad stack',
  description: `The stack has an unexpected length or contents.`
})

ErrorDescriptions.set('michelson_v1.bad_stack_item', {
  title: 'Bad stack item',
  description: `The type of a stack item is unexpected (this error is always`
})

ErrorDescriptions.set('michelson_v1.cannot_serialize_error', {
  title: 'Not enough gas to serialize error',
  description: `The error was too big to be serialized with the provided gas`
})

ErrorDescriptions.set('michelson_v1.cannot_serialize_failure', {
  title: 'Not enough gas to serialize argument of FAILWITH',
  description: `Argument of FAILWITH was too big to be serialized with the provided`
})

ErrorDescriptions.set('michelson_v1.cannot_serialize_log', {
  title: 'Not enough gas to serialize execution trace',
  description: `Execution trace with stacks was to big to be serialized with the`
})

ErrorDescriptions.set('michelson_v1.cannot_serialize_storage', {
  title: 'Not enough gas to serialize execution storage',
  description: `The returned storage was too big to be serialized with the provided`
})

ErrorDescriptions.set('michelson_v1.comparable_type_expected', {
  title: 'Comparable type expected',
  description: `A non comparable type was used in a place where only comparable`
})

ErrorDescriptions.set('michelson_v1.deprecated_instruction', {
  title: 'Script is using a deprecated instruction',
  description: `A deprecated instruction usage is disallowed in newly created`
})

ErrorDescriptions.set('michelson_v1.duplicate_entrypoint', {
  title: 'Duplicate entrypoint (type error)',
  description: `Two entrypoints have the same name.`
})

ErrorDescriptions.set('michelson_v1.duplicate_map_keys', {
  title: 'Duplicate map keys',
  description: `Map literals cannot contain duplicated keys`
})

ErrorDescriptions.set('michelson_v1.duplicate_script_field', {
  title: 'Script has a duplicated field (parse error)',
  description: `When parsing script, a field was found more than once`
})

ErrorDescriptions.set('michelson_v1.duplicate_set_values_in_literal', {
  title: 'Sets literals cannot contain duplicate elements',
  description: `Set literals cannot contain duplicate elements, but a duplicae was`
})

ErrorDescriptions.set('michelson_v1.entrypoint_name_too_long', {
  title: 'Entrypoint name too long (type error)',
  description: `An entrypoint name exceeds the maximum length of 31 characters.`
})

ErrorDescriptions.set('michelson_v1.fail_not_in_tail_position', {
  title: 'FAIL not in tail position',
  description: `There is non trivial garbage code after a FAIL instruction.`
})

ErrorDescriptions.set('michelson_v1.ill_formed_type', {
  title: 'Ill formed type',
  description: `The toplevel error thrown when trying to parse a type expression`
})

ErrorDescriptions.set('michelson_v1.ill_typed_contract', {
  title: 'Ill typed contract',
  description: `The toplevel error thrown when trying to typecheck a contract code`
})

ErrorDescriptions.set('michelson_v1.ill_typed_data', {
  title: 'Ill typed data',
  description: `The toplevel error thrown when trying to typecheck a data expression`
})

ErrorDescriptions.set('michelson_v1.inconsistent_annotations', {
  title: 'Annotations inconsistent between branches',
  description: `The annotations on two types could not be merged`
})

ErrorDescriptions.set('michelson_v1.inconsistent_field_annotations', {
  title: 'Annotations for field accesses is inconsistent',
  description: `The specified field does not match the field annotation in the type`
})

ErrorDescriptions.set('michelson_v1.inconsistent_stack_lengths', {
  title: 'Inconsistent stack lengths',
  description: `A stack was of an unexpected length (this error is always in the`
})

ErrorDescriptions.set('michelson_v1.inconsistent_type_annotations', {
  title: 'Types contain inconsistent annotations',
  description: `The two types contain annotations that do not match`
})

ErrorDescriptions.set('michelson_v1.inconsistent_types', {
  title: 'Inconsistent types',
  description: `This is the basic type clash error, that appears in several places`
})

ErrorDescriptions.set('michelson_v1.invalid_arity', {
  title: 'Invalid arity',
  description: `In a script or data expression, a primitive was applied to an`
})

ErrorDescriptions.set('michelson_v1.invalid_big_map', {
  title: 'Invalid big_map',
  description: `A script or data expression references a big_map that does not exist`
})

ErrorDescriptions.set('michelson_v1.invalid_constant', {
  title: 'Invalid constant',
  description: `A data expression was invalid for its expected type.`
})

ErrorDescriptions.set('michelson_v1.invalid_contract', {
  title: 'Invalid contract',
  description: `A script or data expression references a contract that does not`
})

ErrorDescriptions.set('michelson_v1.invalid_expression_kind', {
  title: 'Invalid expression kind',
  description: `In a script or data expression, an expression was of the wrong kind`
})

ErrorDescriptions.set('michelson_v1.invalid_iter_body', {
  title: 'ITER body returned wrong stack type',
  description: `The body of an ITER instruction must result in the same stack type`
})

ErrorDescriptions.set('michelson_v1.invalid_map_block_fail', {
  title: 'FAIL instruction occurred as body of map block',
  description: `FAIL cannot be the only instruction in the body. The propper type of`
})

ErrorDescriptions.set('michelson_v1.invalid_map_body', {
  title: 'Invalid map body',
  description: `The body of a map block did not match the expected type`
})

ErrorDescriptions.set('michelson_v1.invalid_primitive', {
  title: 'Invalid primitive',
  description: `In a script or data expression, a primitive was unknown.`
})

ErrorDescriptions.set('michelson_v1.invalid_primitive_name', {
  title: 'Invalid primitive name',
  description: `In a script or data expression, a primitive name is unknown or has a`
})

ErrorDescriptions.set('michelson_v1.invalid_primitive_name_case', {
  title: 'Invalid primitive name case',
  description: `In a script or data expression, a primitive name is neither`
})

ErrorDescriptions.set('michelson_v1.invalid_primitive_namespace', {
  title: 'Invalid primitive namespace',
  description: `In a script or data expression, a primitive was of the wrong`
})

ErrorDescriptions.set('michelson_v1.missing_script_field', {
  title: 'Script is missing a field (parse error)',
  description: `When parsing script, a field was expected, but not provided`
})

ErrorDescriptions.set('michelson_v1.no_such_entrypoint', {
  title: 'No such entrypoint (type error)',
  description: `An entrypoint was not found when calling a contract.`
})

ErrorDescriptions.set('michelson_v1.runtime_error', {
  title: 'Script runtime error',
  description: `Toplevel error for all runtime script errors`
})

ErrorDescriptions.set('michelson_v1.script_overflow', {
  title: 'Script failed (overflow error)',
  description: `A FAIL instruction was reached due to the detection of an overflow`
})

ErrorDescriptions.set('michelson_v1.script_rejected', {
  title: 'Script failed',
  description: `A FAILWITH instruction was reached`
})

ErrorDescriptions.set('michelson_v1.self_in_lambda', {
  title: 'SELF instruction in lambda',
  description: `A SELF instruction was encountered in a lambda expression.`
})

ErrorDescriptions.set('michelson_v1.type_too_large', {
  title: 'Stack item type too large',
  description: `An instruction generated a type larger than the limit.`
})

ErrorDescriptions.set('michelson_v1.undefined_binop', {
  title: 'Undefined binop',
  description: `A binary operation is called on operands of types over which it is`
})

ErrorDescriptions.set('michelson_v1.undefined_unop', {
  title: 'Undefined unop',
  description: `A unary operation is called on an operand of type over which it is`
})

ErrorDescriptions.set('michelson_v1.unexpected_annotation', {
  title: 'An annotation was encountered where no annotation is expected',
  description: `A node in the syntax tree was impropperly annotated`
})

ErrorDescriptions.set('michelson_v1.unexpected_bigmap', {
  title: 'Big map in unauthorized position (type error)',
  description: `When parsing script, a big_map type was found in a position where it`
})

ErrorDescriptions.set('michelson_v1.unexpected_contract', {
  title: 'Contract in unauthorized position (type error)',
  description: `When parsing script, a contract type was found in the storage or`
})

ErrorDescriptions.set('michelson_v1.unexpected_operation', {
  title: 'Operation in unauthorized position (type error)',
  description: `When parsing script, an operation type was found in the storage or`
})

ErrorDescriptions.set('michelson_v1.ungrouped_annotations', {
  title: 'Annotations of the same kind were found spread apart',
  description: `Annotations of the same kind must be grouped`
})

ErrorDescriptions.set('michelson_v1.unknown_primitive_name', {
  title: 'Unknown primitive name',
  description: `In a script or data expression, a primitive was unknown.`
})

ErrorDescriptions.set('michelson_v1.unmatched_branches', {
  title: 'Unmatched branches',
  description: `At the join point at the end of two code branches the stacks have`
})

ErrorDescriptions.set('michelson_v1.unordered_map_literal', {
  title: 'Invalid map key order',
  description: `Map keys must be in strictly increasing order`
})

ErrorDescriptions.set('michelson_v1.unordered_set_literal', {
  title: 'Invalid set value order',
  description: `Set values must be in strictly increasing order`
})

ErrorDescriptions.set('michelson_v1.unreachable_entrypoint', {
  title: 'Unreachable entrypoint (type error)',
  description: `An entrypoint in the contract is not reachable.`
})

ErrorDescriptions.set('nonce.previously_revealed', {
  title: 'Previously revealed nonce',
  description: `Duplicated revelation for a nonce.`
})

ErrorDescriptions.set('nonce.too_early_revelation', {
  title: 'Too early nonce revelation',
  description: `Nonce revelation happens before cycle end`
})

ErrorDescriptions.set('nonce.too_late_revelation', {
  title: 'Too late nonce revelation',
  description: `Nonce revelation happens too late`
})

ErrorDescriptions.set('nonce.unexpected', {
  title: 'Unexpected nonce',
  description: `The provided nonce is inconsistent with the committed nonce hash.`
})

ErrorDescriptions.set('operation.cannot_parse', {
  title: 'Cannot parse operation',
  description: `The operation is ill-formed or for another protocol version`
})

ErrorDescriptions.set('operation.duplicate_endorsement', {
  title: 'Duplicate endorsement',
  description: `Two endorsements received from same delegate`
})

ErrorDescriptions.set('operation.invalid_activation', {
  title: 'Invalid activation',
  description: `The given key and secret do not correspond to any existing`
})

ErrorDescriptions.set('operation.invalid_endorsement_level', {
  title: 'Unexpected level in endorsement',
  description: `The level of an endorsement is inconsistent with the  provided block`
})

ErrorDescriptions.set('operation.invalid_signature', {
  title: 'Invalid operation signature',
  description: `The operation signature is ill-formed or has been made with the`
})

ErrorDescriptions.set('operation.missing_signature', {
  title: 'Missing operation signature',
  description: `The operation is of a kind that must be signed, but the signature is`
})

ErrorDescriptions.set('operation.not_enought_endorsements_for_priority', {
  title: 'Not enough endorsements for priority',
  description: `The block being validated does not include the required minimum`
})

ErrorDescriptions.set('operation.wrong_endorsement_predecessor', {
  title: 'Wrong endorsement predecessor',
  description: `Trying to include an endorsement in a block that is not the`
})

ErrorDescriptions.set('operation.wrong_voting_period', {
  title: 'Wrong voting period',
  description: `Trying to onclude a proposal or ballot meant for another voting`
})

ErrorDescriptions.set('seed.unknown_seed', {
  title: 'Unknown seed',
  description: `The requested seed is not available`
})

ErrorDescriptions.set('storage_exhausted.operation', {
  title: 'Storage quota exceeded for the operation',
  description: `A script or one of its callee wrote more bytes than the operation`
})

ErrorDescriptions.set('storage_limit_too_high', {
  title: 'Storage limit out of protocol hard bounds',
  description: `A transaction tried to exceed the hard limit on storage`
})

ErrorDescriptions.set('tez.addition_overflow', {
  title: 'Overflowing tez addition',
  description: `An addition of two tez amounts overflowed`
})

ErrorDescriptions.set('tez.invalid_divisor', {
  title: 'Invalid tez divisor',
  description: `Multiplication of a tez amount by a non positive integer`
})

ErrorDescriptions.set('tez.multiplication_overflow', {
  title: 'Overflowing tez multiplication',
  description: `A multiplication of a tez amount by an integer overflowed`
})

ErrorDescriptions.set('tez.negative_multiplicator', {
  title: 'Negative tez multiplicator',
  description: `Multiplication of a tez amount by a negative integer`
})

ErrorDescriptions.set('tez.subtraction_underflow', {
  title: 'Underflowing tez subtraction',
  description: `An subtraction of two tez amounts underflowed`
})

ErrorDescriptions.set('timestamp_add', {
  title: 'Timestamp add',
  description: `Overflow when adding timestamps.`
})

ErrorDescriptions.set('timestamp_sub', {
  title: 'Timestamp sub',
  description: `Substracting timestamps resulted in negative period.`
})

ErrorDescriptions.set('too_many_internal_operations', {
  title: 'Too many internal operations',
  description: `A transaction exceeded the hard limit of internal operations it can`
})

ErrorDescriptions.set('too_many_proposals', {
  title: 'Too many proposals',
  description: `The delegate reached the maximum number of allowed proposals.`
})

ErrorDescriptions.set('unauthorized_ballot', {
  title: 'Unauthorized ballot',
  description: `The delegate provided for the ballot is not in the voting listings.`
})

ErrorDescriptions.set('unauthorized_proposal', {
  title: 'Unauthorized proposal',
  description: `The delegate provided for the proposal is not in the voting`
})

ErrorDescriptions.set('undefined_operation_nonce', {
  title: 'Ill timed access to the origination nonce',
  description: `An origination was attemped out of the scope of a manager operation`
})

ErrorDescriptions.set('unexpected_ballot', {
  title: 'Unexpected ballot',
  description: `Ballot recorded outside of a voting period.`
})

ErrorDescriptions.set('unexpected_level', {
  title: 'Unexpected level',
  description: `Level must be non-negative.`
})

ErrorDescriptions.set('unexpected_nonce_length', {
  title: 'Unexpected nonce length',
  description: `Nonce length is incorrect.`
})

ErrorDescriptions.set('unexpected_proposal', {
  title: 'Unexpected proposal',
  description: `Proposal recorded outside of a proposal period.`
})

ErrorDescriptions.set('node.bootstrap_pipeline.invalid_locator', {
  title: 'Invalid block locator',
  description: `Block locator is invalid.`
})

ErrorDescriptions.set('node.bootstrap_pipeline.too_short_locator', {
  title: 'Too short locator',
  description: `Block locator is too short.`
})

ErrorDescriptions.set('node.p2p_io_scheduler.connection_closed', {
  title: 'Connection closed',
  description: `IO error: connection with a peer is closed.`
})

ErrorDescriptions.set('node.p2p_pool.connected', {
  title: 'Connected',
  description: `Fail to connect with a peer: a connection is already established.`
})

ErrorDescriptions.set('node.p2p_pool.connection_refused', {
  title: 'Connection refused',
  description: `Connection was refused.`
})

ErrorDescriptions.set('node.p2p_pool.peer_banned', {
  title: 'Peer Banned',
  description: `The peer identity you tried to connect is banned.`
})

ErrorDescriptions.set('node.p2p_pool.pending_connection', {
  title: 'Pending connection',
  description: `Fail to connect with a peer: a connection is already pending.`
})

ErrorDescriptions.set('node.p2p_pool.point_banned', {
  title: 'Point Banned',
  description: `The address you tried to connect is banned.`
})

ErrorDescriptions.set('node.p2p_pool.private_mode', {
  title: 'Private mode',
  description: `Node is in private mode.`
})

ErrorDescriptions.set('node.p2p_pool.rejected', {
  title: 'Rejected peer',
  description: `Connection to peer was rejected by us.`
})

ErrorDescriptions.set('node.p2p_pool.too_many_connections', {
  title: 'Too many connections',
  description: `Too many connections.`
})

ErrorDescriptions.set('node.p2p_socket.decipher_error', {
  title: 'Decipher error',
  description: `An error occurred while deciphering.`
})

ErrorDescriptions.set('node.p2p_socket.decoding_error', {
  title: 'Decoding error',
  description: `An error occurred while decoding.`
})

ErrorDescriptions.set('node.p2p_socket.invalid_auth', {
  title: 'Invalid authentication',
  description: `Rejected peer connection: invalid authentication.`
})

ErrorDescriptions.set('node.p2p_socket.invalid_chunks_size', {
  title: 'Invalid chunks size',
  description: `Size of chunks is not valid.`
})

ErrorDescriptions.set('node.p2p_socket.invalid_incoming_ciphertext_size', {
  title: 'Invalid incoming ciphertext size',
  description: `The announced size for the incoming ciphertext is invalid.`
})

ErrorDescriptions.set('node.p2p_socket.invalid_message_size', {
  title: 'Invalid message size',
  description: `The size of the message to be written is invalid.`
})

ErrorDescriptions.set('node.p2p_socket.myself', {
  title: 'Myself',
  description: `Remote peer is actually yourself.`
})

ErrorDescriptions.set('node.p2p_socket.not_enough_proof_of_work', {
  title: 'Not enough proof of work',
  description: `Remote peer cannot be authenticated: not enough proof of work.`
})

ErrorDescriptions.set('node.p2p_socket.rejected_by_nack', {
  title: 'Rejected socket connection by Nack',
  description: `Rejected peer connection: The peer rejected the socket connection by`
})

ErrorDescriptions.set('node.p2p_socket.rejected_no_common_protocol', {
  title: 'Rejected socket connection - no common network protocol',
  description: `Rejected peer connection: rejected socket connection as we have no`
})

ErrorDescriptions.set('node.p2p_socket.rejected_socket_connection', {
  title: 'Rejected socket connection',
  description: `Rejected peer connection: rejected socket connection.`
})

ErrorDescriptions.set('node.p2p_socket.rejecting_incoming', {
  title: 'Rejecting socket connection',
  description: `Rejecting peer connection with motive.`
})

ErrorDescriptions.set('node.peer_validator.known_invalid', {
  title: 'Known invalid',
  description: `Known invalid block found in the peer's chain`
})

ErrorDescriptions.set('node.peer_validator.unknown_ancestor', {
  title: 'Unknown ancestor',
  description: `Unknown ancestor block found in the peer's chain`
})

ErrorDescriptions.set('node.prevalidation.future_block_header', {
  title: 'Future block header',
  description: `The block was annotated with a time too far in the future.`
})

ErrorDescriptions.set('node.prevalidation.oversized_operation', {
  title: 'Oversized operation',
  description: `The operation size is bigger than allowed.`
})

ErrorDescriptions.set('node.prevalidation.parse_error', {
  title: 'Parsing error in prevalidation',
  description: `Raised when an operation has not been parsed correctly during`
})

ErrorDescriptions.set('node.prevalidation.too_many_operations', {
  title: 'Too many pending operations in prevalidation',
  description: `The prevalidation context is full.`
})

ErrorDescriptions.set('node.state.bad_data_dir', {
  title: 'Bad data directory',
  description: `The data directory could not be read. This could be because it was`
})

ErrorDescriptions.set('node.state.block.inconsistent_context_hash', {
  title: 'Inconsistent commit hash',
  description: `When committing the context of a block, the announced context hash`
})

ErrorDescriptions.set('node.state.block_not_invalid', {
  title: 'Block not invalid',
  description: `The invalid block to be unmarked was not actually invalid.`
})

ErrorDescriptions.set('node.state.unknown_chain', {
  title: 'Unknown chain',
  description: `The chain identifier could not be found in the chain identifiers`
})

ErrorDescriptions.set('node.validator.checkpoint_error', {
  title: 'Block incompatible with the current checkpoint.',
  description: `The block belongs to a branch that is not compatible with the`
})

ErrorDescriptions.set('node.validator.inactive_chain', {
  title: 'Inactive chain',
  description: `Attempted validation of a block from an inactive chain.`
})

ErrorDescriptions.set('node_config_file.incorrect_history_mode_switch', {
  title: 'Incorrect history mode switch',
  description: `Incorrect history mode switch.`
})

ErrorDescriptions.set('raw_store.unknown', {
  title: 'Missing key in store',
  description: `Missing key in store`
})

ErrorDescriptions.set('validator.inconsistent_operations_hash', {
  title: 'Invalid merkle tree',
  description: `The provided list of operations is inconsistent with the block`
})

ErrorDescriptions.set('validator.missing_test_protocol', {
  title: 'Missing test protocol',
  description: `Missing test protocol when forking the test chain`
})

ErrorDescriptions.set('validator.unavailable_protocol', {
  title: 'Missing protocol',
  description: `The protocol required for validating a block is missing.`
})

ErrorDescriptions.set('validator.validation_process_failed', {
  title: 'Validation process failed',
  description: `Failed to validate block using external validation process.`
})

ErrorDescriptions.set('worker.closed', {
  title: 'Worker closed',
  description: `An operation on a worker could not complete before it was shut down.`
})

ErrorDescriptions.set('micheline.parse_error.annotation_exceeds_max_length', {
  title: 'Micheline parser error: annotation exceeds max length',
  description: `While parsing a piece of Micheline source, an annotation exceeded`
})

ErrorDescriptions.set('micheline.parse_error.empty_expression', {
  title: 'Micheline parser error: empty_expression',
  description: `Tried to interpret an empty piece or Micheline source as a single`
})

ErrorDescriptions.set('micheline.parse_error.extra_token', {
  title: 'Micheline parser error: extra token',
  description: `While parsing a piece of Micheline source, an extra semi colon or`
})

ErrorDescriptions.set('micheline.parse_error.invalid_utf8_sequence', {
  title: 'Micheline parser error: invalid UTF-8 sequence',
  description: `While parsing a piece of Micheline source, a sequence of bytes that`
})

ErrorDescriptions.set('micheline.parse_error.misaligned_node', {
  title: 'Micheline parser error: misaligned node',
  description: `While parsing a piece of Micheline source, an expression was not`
})

ErrorDescriptions.set('micheline.parse_error.missing_break_after_number', {
  title: 'Micheline parser error: missing break after number',
  description: `While parsing a piece of Micheline source, a number was not visually`
})

ErrorDescriptions.set('micheline.parse_error.odd_lengthed_bytes', {
  title: 'Micheline parser error: odd lengthed bytes',
  description: `While parsing a piece of Micheline source, the length of a byte`
})

ErrorDescriptions.set('micheline.parse_error.unclosed_token', {
  title: 'Micheline parser error: unclosed token',
  description: `While parsing a piece of Micheline source, a parenthesis or a brace`
})

ErrorDescriptions.set('micheline.parse_error.undefined_escape_sequence', {
  title: 'Micheline parser error: undefined escape sequence',
  description: `While parsing a piece of Micheline source, an unexpected escape`
})

ErrorDescriptions.set('micheline.parse_error.unexpected_character', {
  title: 'Micheline parser error: unexpected character',
  description: `While parsing a piece of Micheline source, an unexpected character`
})

ErrorDescriptions.set('micheline.parse_error.unexpected_token', {
  title: 'Micheline parser error: unexpected token',
  description: `While parsing a piece of Micheline source, an unexpected token was`
})

ErrorDescriptions.set('micheline.parse_error.unterminated_comment', {
  title: 'Micheline parser error: unterminated comment',
  description: `While parsing a piece of Micheline source, a commentX was not`
})

ErrorDescriptions.set('micheline.parse_error.unterminated_integer', {
  title: 'Micheline parser error: unterminated integer',
  description: `While parsing a piece of Micheline source, an integer was not`
})

ErrorDescriptions.set('micheline.parse_error.unterminated_string', {
  title: 'Micheline parser error: unterminated string',
  description: `While parsing a piece of Micheline source, a string was not`
})

ErrorDescriptions.set('rpc_client.request_failed', {
  title: '',
  description: ``
})

ErrorDescriptions.set('Bad_hash', {
  title: 'Bad hash',
  description: `Wrong hash given`
})

ErrorDescriptions.set('Block_validator_process.failed_to_checkout_context', {
  title: 'Fail during checkout context',
  description: `The context checkout failed using a given hash`
})

ErrorDescriptions.set('Block_validator_process.failed_to_get_live_block', {
  title: 'Fail to get live blocks',
  description: `Unable to get live blocks from a given hash`
})

ErrorDescriptions.set('CannotReconstruct', {
  title: 'Cannot reconstruct',
  description: `Cannot reconstruct`
})

ErrorDescriptions.set('Context_not_found', {
  title: 'Context not found',
  description: `Cannot find context corresponding to hash`
})

ErrorDescriptions.set('InconsistentImportedBlock', {
  title: 'Inconsistent imported block',
  description: `The imported block is not the expected one.`
})

ErrorDescriptions.set('InconsistentOperationHashes', {
  title: 'Inconsistent operation hashes',
  description: `The operations given do not match their hashes.`
})

ErrorDescriptions.set('Inconsistent_snapshot_data', {
  title: 'Inconsistent snapshot data',
  description: `The data provided by the snapshot is inconsistent`
})

ErrorDescriptions.set('Inconsistent_snapshot_file', {
  title: 'Inconsistent snapshot file',
  description: `Error while opening snapshot file`
})

ErrorDescriptions.set('InvalidBlockSpecification', {
  title: 'Invalid block specification',
  description: `Invalid specification of block to import`
})

ErrorDescriptions.set('Invalid_snapshot_version', {
  title: 'Invalid snapshot version',
  description: `The version of the snapshot to import is not valid`
})

ErrorDescriptions.set('Missing_snapshot_data', {
  title: 'Missing data in imported snapshot',
  description: `Mandatory data missing while reaching end of snapshot file.`
})

ErrorDescriptions.set('RPC.Unexpected_error_encoding', {
  title: 'RPC fails with an unparsable error message',
  description: `The RPC returned with an error code, and the associated body was not`
})

ErrorDescriptions.set('RPC_context.Gone', {
  title: 'RPC lookup failed because of deleted data',
  description: `RPC lookup failed. Block has been pruned and requested data deleted.`
})

ErrorDescriptions.set('RPC_context.Not_found', {
  title: 'RPC lookup failed',
  description: `RPC lookup failed. No RPC exists at the URL or the RPC tried to`
})

ErrorDescriptions.set('Restore_context_failure', {
  title: 'Failed to restore context',
  description: `Internal error while restoring the context`
})

ErrorDescriptions.set('SnapshotImportFailure', {
  title: 'Snapshot import failure',
  description: `The imported snapshot is malformed.`
})

ErrorDescriptions.set('System_read_error', {
  title: 'System read error',
  description: `Failed to read file`
})

ErrorDescriptions.set('Validator_process.system_error_while_validating', {
  title: 'Failed to validate block because of a system error',
  description: `The validator failed because of a system error`
})

ErrorDescriptions.set('Writing_error', {
  title: 'Writing error',
  description: `Cannot write in file for context dump`
})

ErrorDescriptions.set('WrongBlockExport', {
  title: 'Wrong block export',
  description: `The block to export in the snapshot is not valid.`
})

ErrorDescriptions.set('WrongProtocolHash', {
  title: 'Wrong protocol hash',
  description: `Wrong protocol hash`
})

ErrorDescriptions.set('WrongSnapshotExport', {
  title: 'Wrong snapshot export',
  description: `Snapshot exports is not compatible with the current configuration.`
})

ErrorDescriptions.set('assertion', {
  title: 'Assertion failure',
  description: `A fatal assertion failed`
})

ErrorDescriptions.set('block_validation.cannot_serialize_metadata', {
  title: 'Cannot serialize metadata',
  description: `Unable to serialize metadata`
})

ErrorDescriptions.set('canceled', {
  title: 'Canceled',
  description: `A promise was unexpectedly canceled`
})

ErrorDescriptions.set('cli.key.invalid_uri', {
  title: 'Invalid key uri',
  description: `A key has been provided with an invalid uri.`
})

ErrorDescriptions.set('cli.signature_mismatch', {
  title: 'Signature mismatch',
  description: `The signer produced an invalid signature`
})

ErrorDescriptions.set('cli.unregistered_key_scheme', {
  title: 'Unregistered key scheme',
  description: `A key has been provided with an unregistered scheme (no`
})

ErrorDescriptions.set('client.alpha.Bad deserialized counter', {
  title: 'Deserialized counter does not match the stored one',
  description: `The byte sequence references a multisig counter that does not match`
})

ErrorDescriptions.set('client.alpha.actionDeserialisation', {
  title: 'The expression is not a valid multisig action',
  description: `When trying to deserialise an action from a sequence of bytes, we`
})

ErrorDescriptions.set('client.alpha.badDeserializedContract', {
  title: 'The byte sequence is not for the given multisig contract',
  description: `When trying to deserialise an action from a sequence of bytes, we`
})

ErrorDescriptions.set('client.alpha.badEndorsementDelayArg', {
  title: 'Bad -endorsement-delay arg',
  description: `invalid duration in -endorsement-delay`
})

ErrorDescriptions.set('client.alpha.badMaxPriorityArg', {
  title: 'Bad -max-priority arg',
  description: `invalid priority in -max-priority`
})

ErrorDescriptions.set('client.alpha.badMaxWaitingTimeArg', {
  title: 'Bad -max-waiting-time arg',
  description: `invalid duration in -max-waiting-time`
})

ErrorDescriptions.set('client.alpha.badMinimalFeesArg', {
  title: 'Bad -minimal-fees arg',
  description: `invalid fee threshold in -fee-threshold`
})

ErrorDescriptions.set('client.alpha.badPreservedLevelsArg', {
  title: 'Bad -preserved-levels arg',
  description: `invalid number of levels in -preserved-levels`
})

ErrorDescriptions.set('client.alpha.badTezArg', {
  title: 'Bad Tez Arg',
  description: `Invalid ꜩ notation in parameter.`
})

ErrorDescriptions.set('client.alpha.bytesDeserialisation', {
  title: 'The byte sequence is not a valid multisig action',
  description: `When trying to deserialise an action from a sequence of bytes, we`
})

ErrorDescriptions.set('client.alpha.contractHasNoScript', {
  title: 'The given contract is not a multisig contract because it has no',
  description: `script`
})

ErrorDescriptions.set('client.alpha.contractHasNoStorage', {
  title: 'The given contract is not a multisig contract because it has no',
  description: `storage`
})

ErrorDescriptions.set('client.alpha.contractHasUnexpectedStorage', {
  title: 'The storage of the given contract is not of the shape expected for a',
  description: `multisig contract`
})

ErrorDescriptions.set('client.alpha.contractWithoutCode', {
  title: 'The given contract has no code',
  description: `Attempt to get the code of a contract failed because it has nocode.`
})

ErrorDescriptions.set('client.alpha.invalidSignature', {
  title: 'The following signature did not match a public key in the given',
  description: `multisig contract`
})

ErrorDescriptions.set('client.alpha.michelson.macros.bas_arity', {
  title: 'Wrong number of arguments to macro',
  description: `A wrong number of arguments was provided to a macro`
})

ErrorDescriptions.set('client.alpha.michelson.macros.sequence_expected', {
  title: 'Macro expects a sequence',
  description: `An macro expects a sequence, but a sequence was not provided`
})

ErrorDescriptions.set('client.alpha.michelson.macros.unexpected_annotation', {
  title: 'Unexpected annotation',
  description: `A macro had an annotation, but no annotation was permitted on this`
})

ErrorDescriptions.set('client.alpha.nonPositiveThreshold', {
  title: 'Given threshold is not positive',
  description: `A multisig threshold should be a positive number`
})

ErrorDescriptions.set('client.alpha.notASupportedMultisigContract', {
  title: 'The given contract is not one of the supported contracts',
  description: `A multisig command has referenced a smart contract whose script is`
})

ErrorDescriptions.set('client.alpha.notEnoughSignatures', {
  title: 'Not enough signatures were provided for this multisig action',
  description: `To run an action on a multisig contract, you should provide at least`
})

ErrorDescriptions.set('client.alpha.thresholdTooHigh', {
  title: 'Given threshold is too high',
  description: `The given threshold is higher than the number of keys, this would`
})

ErrorDescriptions.set('context.non_recoverable_context', {
  title: 'Non recoverable context',
  description: `Cannot recover from a corrupted context.`
})

ErrorDescriptions.set('context_dump.read.cannot_open', {
  title: 'Cannot open file for context restoring',
  description: ``
})

ErrorDescriptions.set('context_dump.read.suspicious', {
  title: 'Suspicious file: data after end',
  description: ``
})

ErrorDescriptions.set('context_dump.write.cannot_open', {
  title: 'Cannot open file for context dump',
  description: ``
})

ErrorDescriptions.set('decoding_error', {
  title: 'Decoding error',
  description: `Error while decoding a value`
})

ErrorDescriptions.set('encoding_error', {
  title: 'Encoding error',
  description: `Error while encoding a value for a socket`
})

ErrorDescriptions.set('failure', {
  title: 'Exception',
  description: `Exception safely wrapped in an error`
})

ErrorDescriptions.set('raw_context.invalid_depth', {
  title: 'Invalid depth argument',
  description: `The raw context extraction depth argument must be positive.`
})

ErrorDescriptions.set('registered_protocol.unregistered_protocol', {
  title: 'Unregistered protocol',
  description: `No protocol was registered with the requested hash.`
})

ErrorDescriptions.set('requester.Operation_hash.fetch_canceled', {
  title: 'Canceled fetch of a Operation_hash',
  description: `The fetch of a Operation_hash has been canceled`
})

ErrorDescriptions.set('requester.Operation_hash.fetch_timeout', {
  title: 'Timed out fetch of a Operation_hash',
  description: `The fetch of a Operation_hash has timed out`
})

ErrorDescriptions.set('requester.Operation_hash.missing', {
  title: 'Missing Operation_hash',
  description: `Some Operation_hash is missing from the requester`
})

ErrorDescriptions.set('requester.Protocol_hash.fetch_canceled', {
  title: 'Canceled fetch of a Protocol_hash',
  description: `The fetch of a Protocol_hash has been canceled`
})

ErrorDescriptions.set('requester.Protocol_hash.fetch_timeout', {
  title: 'Timed out fetch of a Protocol_hash',
  description: `The fetch of a Protocol_hash has timed out`
})

ErrorDescriptions.set('requester.Protocol_hash.missing', {
  title: 'Missing Protocol_hash',
  description: `Some Protocol_hash is missing from the requester`
})

ErrorDescriptions.set('requester.block_hash.fetch_canceled', {
  title: 'Canceled fetch of a block_hash',
  description: `The fetch of a block_hash has been canceled`
})

ErrorDescriptions.set('requester.block_hash.fetch_timeout', {
  title: 'Timed out fetch of a block_hash',
  description: `The fetch of a block_hash has timed out`
})

ErrorDescriptions.set('requester.block_hash.missing', {
  title: 'Missing block_hash',
  description: `Some block_hash is missing from the requester`
})

ErrorDescriptions.set('requester.operations.fetch_canceled', {
  title: 'Canceled fetch of a operations',
  description: `The fetch of a operations has been canceled`
})

ErrorDescriptions.set('requester.operations.fetch_timeout', {
  title: 'Timed out fetch of a operations',
  description: `The fetch of a operations has timed out`
})

ErrorDescriptions.set('requester.operations.missing', {
  title: 'Missing operations',
  description: `Some operations is missing from the requester`
})

ErrorDescriptions.set('socket.unexepcted_size_of_decoded_value', {
  title: 'Unexpected size of decoded value',
  description: `A decoded value comes from a buffer of unexpected size.`
})

ErrorDescriptions.set('state.block.contents_not_found', {
  title: 'Block_contents_not_found',
  description: `Block not found`
})

ErrorDescriptions.set('state.block.not_found', {
  title: 'Block_not_found',
  description: `Block not found`
})

ErrorDescriptions.set('unexepcted_size_of_encoded_value', {
  title: 'Unexpected size of encoded value',
  description: `An encoded value is not of the expected size.`
})

ErrorDescriptions.set('unix.system_info', {
  title: 'Unix System_info failure',
  description: `Unix System_info failure`
})

ErrorDescriptions.set('unix_error', {
  title: 'Unix error',
  description: `An unhandled unix exception`
})

ErrorDescriptions.set('utils.Canceled', {
  title: 'Canceled',
  description: `Canceled`
})

ErrorDescriptions.set('utils.Timeout', {
  title: 'Timeout',
  description: `Timeout`
})

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

  const startId = operationError.id.indexOf('proto.006-PsCARTHA.')
  let id = operationError.id.slice(startId + 19, operationError.id.length)

  return ErrorDescriptions.get(id)
}
