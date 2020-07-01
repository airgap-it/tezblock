// in accounts.json file
export interface JsonAccountData {
  address: string
  alias: string
  hasLogo: boolean
  hasPayoutAddress?: string
  logoReference?: string
  accountType?: string
  acceptsDelegations?: boolean
}

export interface Account {
  block_level: number
  balance: number
  delegate_value: string
  account_id: string
  manager: string
  counter: number
  block_id: string
  proposal: string
  is_baker: boolean
}
