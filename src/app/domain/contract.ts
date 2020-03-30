import { IAirGapTransaction } from 'airgap-coin-lib'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { Data } from '@tezblock/domain/table'
import { first } from '@tezblock/services/fp'
import { SearchOption, SearchOptionType } from '@tezblock/services/search/model'

export const tokenContracts: { [key: string]: TokenContract } = require('../../assets/contracts/json/contracts.json')

export enum SocialType {
  website = 'website',
  twitter = 'twitter',
  telegram = 'telegram',
  medium = 'medium',
  github = 'github'
}

export interface Social {
  type: SocialType
  url: string
}

export interface TokenContract {
  id?: string
  symbol: string
  name: string
  website: string
  description: string
  socials: Social[],
  tezosNetwork?: TezosNetwork[],
  totalSupply?: string
}

export interface ContractOperation extends IAirGapTransaction {
  singleFrom: string
  singleTo: string
}

export const getTokenContractByAddress = (address: string): TokenContract => tokenContracts[address]

export const getTokenContracts = (limit: number): Data<TokenContract> => ({
  data: Object.keys(tokenContracts)
    .map(key => ({ ...tokenContracts[key], id: key }))
    .slice(0, limit),
  total: Object.keys(tokenContracts).length
})

export const airGapTransactionToContractOperation = (airGapTransaction: IAirGapTransaction): ContractOperation => ({
  ...airGapTransaction,
  singleFrom: first(airGapTransaction.from),
  singleTo: first(airGapTransaction.to)
})

export const searchTokenContracts = (searchTerm: string): SearchOption[] => {
  if (!searchTerm) {
    return []
  }

  const type = SearchOptionType.faContract
  const tokenContractByAddress = getTokenContractByAddress(searchTerm)

  return Object.keys(tokenContracts)
    .filter(key => tokenContracts[key].name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
    .map(key => ({
      name: tokenContracts[key].name,
      type
    }))
    .concat(
      tokenContractByAddress
        ? [
            {
              name: tokenContractByAddress.name,
              type
            }
          ]
        : []
    )
}

export const getTokenContractBy = (searchTerm: string): TokenContract => {
  if (!searchTerm) {
    return undefined
  }

  const tokenContractByAddress = getTokenContractByAddress(searchTerm)

  return first(
    Object.keys(tokenContracts)
      .filter(key => tokenContracts[key].name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
      .map(
        key =>
          <TokenContract>{
            ...tokenContracts[key],
            id: key
          }
      )
      .concat(tokenContractByAddress ? [tokenContractByAddress] : [])
  )
}
