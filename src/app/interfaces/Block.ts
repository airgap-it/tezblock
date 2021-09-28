export interface Block {
  meta_voting_period: number;
  operations_hash: string;
  meta_level_position: number;
  consumed_gas: number;
  timestamp: number;
  current_expected_quorum?: any; // TODO: any
  context: string;
  baker: string;
  active_proposal?: any;
  proto: number;
  signature: string;
  meta_cycle: number;
  period_kind: string;
  hash: string;
  meta_voting_period_position: number;
  fitness: string;
  validation_pass: number;
  meta_level: number;
  nonce_hash?: any;
  expected_commitment: boolean;
  protocol: string;
  predecessor: string;
  meta_cycle_position: number;
  chain_id: string;
  level: number;
  // These are our own properties
  volume: number;
  fee: number;
  txcount: string;
}
