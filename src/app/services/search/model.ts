export interface SearchOption {
  name: string
  type: string
}

export enum SearchOptionType {
  transaction = 'Transactions',
  account = 'Accounts',
  baker = 'Bakers',
  block = 'Blocks',
  faContract = 'Asset Smart Contracts'
}
