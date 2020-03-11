import { IAirGapTransaction } from 'airgap-coin-lib'

import { Data } from '@tezblock/domain/table'
import { first } from '@tezblock/services/fp'

const tokenContracts = require('../../assets/contracts/json/contracts.json')

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
