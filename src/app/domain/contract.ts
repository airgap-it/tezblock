import { IAirGapTransaction } from 'airgap-coin-lib'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { negate, isNil } from 'lodash'

import { Data } from '@tezblock/domain/table'
import { first } from '@tezblock/services/fp'
import { SearchOption, SearchOptionType } from '@tezblock/services/search/model'
import { get } from '@tezblock/services/fp'

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
  socials: Social[]
  tezosNetwork?: TezosNetwork[]
  totalSupply?: string
  decimals?: number
}

export interface ContractOperation extends IAirGapTransaction {
  singleFrom: string
  singleTo: string
}

const networkCondition = (tezosNetwork: TezosNetwork) => (tokenContract: TokenContract): boolean => {
  if (!tokenContract.tezosNetwork) {
    return true
  }

  return tokenContract.tezosNetwork.some(_tezosNetwork => _tezosNetwork === tezosNetwork)
}

export const getTokenContractByAddress = (address: string, tezosNetwork: TezosNetwork): TokenContract =>
  get<TokenContract>(tokenContract => {
    const isInNetwork = networkCondition(tezosNetwork)

    return isInNetwork(tokenContract)
      ? {
          ...tokenContract,
          id: address
        }
      : undefined
  })(tokenContracts[address])

export const getTokenContracts = (tezosNetwork: TezosNetwork, limit?: number): Data<TokenContract> => {
  const data = Object.keys(tokenContracts)
    .map(key => getTokenContractByAddress(key, tezosNetwork))
    .filter(negate(isNil))
    .slice(0, limit || Number.MAX_SAFE_INTEGER)

  return {
    data,
    total: data.length
  }
}

export const airGapTransactionToContractOperation = (airGapTransaction: IAirGapTransaction): ContractOperation => ({
  ...airGapTransaction,
  singleFrom: first(airGapTransaction.from),
  singleTo: first(airGapTransaction.to)
})

export const searchTokenContracts = (searchTerm: string, tezosNetwork: TezosNetwork): SearchOption[] => {
  if (!searchTerm) {
    return []
  }

  const type = SearchOptionType.faContract
  const tokenContractByAddress = getTokenContractByAddress(searchTerm, tezosNetwork)

  return getTokenContracts(tezosNetwork)
    .data.filter(tokenContract => tokenContract.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
    .map(tokenContract => ({
      name: tokenContract.name,
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

export const getTokenContractBy = (searchTerm: string, tezosNetwork: TezosNetwork): TokenContract => {
  if (!searchTerm) {
    return undefined
  }

  const tokenContractByAddress = getTokenContractByAddress(searchTerm, tezosNetwork)

  return first(
    getTokenContracts(tezosNetwork)
      .data.filter(tokenContract => tokenContract.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
      .concat(tokenContractByAddress ? [tokenContractByAddress] : [])
  )
}
