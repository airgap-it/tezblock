import { IAirGapTransaction } from 'airgap-coin-lib'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { negate, isNil, get } from 'lodash'
import BigNumber from 'bignumber.js'

import { Data } from '@tezblock/domain/table'
import { first } from '@tezblock/services/fp'
import { SearchOption, SearchOptionType } from '@tezblock/services/search/model'
import { get as fpGet } from '@tezblock/services/fp'
import { Conventer } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { ExchangeRates } from '@tezblock/services/cache/cache.service'
import { Currency } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { isInBTC } from '@tezblock/domain/airgap'

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
  symbol?: string
  decimals?: number
}

const networkCondition = (tezosNetwork: TezosNetwork) => (tokenContract: TokenContract): boolean => {
  if (!tokenContract.tezosNetwork) {
    return true
  }

  return tokenContract.tezosNetwork.some(_tezosNetwork => _tezosNetwork === tezosNetwork)
}

export const getTokenContractByAddress = (address: string, tezosNetwork: TezosNetwork): TokenContract =>
  fpGet<TokenContract>(tokenContract => {
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

export const getConventer = (contract: { decimals?: number }): Conventer => {
  if (isNil(contract) || isNil(contract.decimals)) {
    return null
  }

  // https://stackoverflow.com/questions/3612744/remove-insignificant-trailing-zeros-from-a-number
  const noInsignificantTrailingZeros = /([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/

  return (amount: any) => (amount / Math.pow(10, contract.decimals)).toFixed(contract.decimals).replace(noInsignificantTrailingZeros, '$1')
}



export const getCurrencyConverterPipeArgs = (contract: { symbol: string }, exchangeRates: ExchangeRates): CurrencyConverterPipeArgs => {
  if (isNil(contract) || !isInBTC(contract.symbol) || !get(exchangeRates, `${Currency.BTC}.${Currency.USD}`)) {
    return null
  }

  return {
    currInfo: {
      symbol: '$',
      currency: 'USD',
      price: new BigNumber(exchangeRates[Currency.BTC][Currency.USD])
    },
    protocolIdentifier: 'BTC'
  }
}
