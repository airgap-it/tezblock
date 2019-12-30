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
  socials: Social[]
}

export const getContractByAddress = (address: string): Contract => contracts[address]