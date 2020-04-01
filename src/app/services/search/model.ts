export interface SearchOption {
  name: string
  type: string
}

export enum SearchOptionType {
  transaction = 'Transactions',
  account = 'Accounts',
  baker = 'Bakers',
  block = 'Blocks',
  faContract = 'FA 1.2 Assets'
}
