export interface Transaction {
  secret?: any // TODO: any (loads of)
  storage_size?: any
  delegatable?: any
  source?: string
  consumed_gas?: number
  timestamp: number
  pkh?: any
  nonce?: any
  block_level: number
  balance?: number
  operation_group_hash: string
  public_key?: any
  paid_storage_size_diff?: any
  amount: number
  delegate: string
  block_hash: string
  spendable?: boolean
  status?: string
  operation_id: number
  manager_pubkey?: any
  slots: string
  storage_limit?: any
  storage?: any
  counter?: any
  script?: any
  kind: string
  gas_limit?: any
  parameters?: any
  destination?: any
  fee: number
  level: number
  delegatedBalance?: number
  proposal?: string
  originated_contracts?: string
  // These are our own properties
  votes?: number
}
