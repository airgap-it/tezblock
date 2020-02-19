import { IAirGapTransaction } from 'airgap-coin-lib'

import { Data } from '@tezblock/domain/table'

const contracts = require('../../assets/contracts/json/contracts.json')

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

export interface Contract {
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

export const getContractByAddress = (address: string): Contract => contracts[address]

export const getContracts = (limit: number): Data<Contract> => ({
  data: Object.keys(contracts)
    .map(key => ({ ...contracts[key], id: key }))
    .slice(0, limit),
  total: Object.keys(contracts).length
})
