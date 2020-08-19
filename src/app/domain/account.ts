// I'm not using: import * as data from thanks to flag "allowSyntheticDefaultImports": true in tsconfig.jsom ( resolves default property problem )
import data from 'src/submodules/tezos_assets/accounts.json'
import { Body, Operation } from '@tezblock/services/base.service'
import { get } from '@tezblock/services/fp'

export interface JsonAccount {
  alias: string
  hasLogo: boolean
  hasPayoutAddress?: string
  logoReference?: string
  accountType?: string
  acceptsDelegations?: boolean
  isExchange?: boolean
}

// in accounts.json file
export interface JsonAccounts {
  [key: string]: JsonAccount
}

export interface JsonAccountData extends JsonAccount {
  address: string
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

export const jsonAccounts: JsonAccounts = data
export const accounts: JsonAccountData[] = Object.keys(data).map(address => ({ ...data[address], address }))

export const getAddressesFilteredBy = (phrase: string) =>
  Object.keys(accounts).filter(address => {
    if (!phrase) {
      return true
    }

    return address.toLowerCase().includes(phrase.toLowerCase())
  })

export const getAddressByAlias = (alias: string): string => accounts.find(account => account.alias === alias)?.address

export const getBakers = (): JsonAccountData[] =>
  accounts.filter(
    account => !account.accountType || get<string>(accountType => !['account', 'contract'].includes(accountType))(account.accountType)
  )

export const doesAcceptsDelegations = (jsonAccount: JsonAccount): boolean =>
  jsonAccount.hasOwnProperty('acceptsDelegations') ? jsonAccount.acceptsDelegations : true

export const getAccountByIdBody = (id: string): Body => ({
  predicates: [
    {
      field: 'account_id',
      operation: Operation.eq,
      set: [id],
      inverse: false
    }
  ],
  limit: 1
})

