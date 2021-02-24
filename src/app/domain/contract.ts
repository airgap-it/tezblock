import { negate, isNil, get, filter } from 'lodash'
import BigNumber from 'bignumber.js'
import { forkJoin, from, Observable, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'

import { Pageable } from '@tezblock/domain/table'
import { SearchOptionData } from '@tezblock/services/search/model'
import { get as fpGet, first, isEmptyArray } from '@tezblock/services/fp'
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { ExchangeRates } from '@tezblock/services/cache/cache.service'
import { Currency, isInBTC, getFaProtocol } from '@tezblock/domain/airgap'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { OperationTypes } from '@tezblock/domain/operations'
// I'm not using: import * as data from thanks to flag "allowSyntheticDefaultImports": true in tsconfig.jsom ( resolves default property problem )
import data from '../../assets/contracts/json/contracts.json'
import { IAirGapTransaction, TezosFAProtocol, TezosNetwork } from '@airgap/coinlib-core'
import { TezosTransactionParameters } from '@airgap/coinlib-core/protocols/tezos/types/operations/Transaction'

export const tokenContracts = data as { [key: string]: TokenContract }

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
  type?: string
  tokenID?: number
}

export interface ContractOperation extends Transaction {
  from: string
  to: string
  parameters: string
  parameters_micheline: string
  parameters_entrypoints: string
  decimals?: number
  entrypoint?: string
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

export const getTokenContracts = (tezosNetwork: TezosNetwork, limit?: number): Pageable<TokenContract> => {
  const data = Object.keys(tokenContracts)
    .map(key => getTokenContractByAddress(key, tezosNetwork))
    .filter(negate(isNil))
    .slice(0, limit || Number.MAX_SAFE_INTEGER)

  return {
    data,
    total: data.length
  }
}

export const searchTokenContracts = (searchTerm: string, tezosNetwork: TezosNetwork): SearchOptionData[] => {
  if (!searchTerm) {
    return []
  }

  const type = OperationTypes.TokenContract
  const tokenContractByAddress = getTokenContractByAddress(searchTerm, tezosNetwork)

  return getTokenContracts(tezosNetwork)
    .data.filter(tokenContract => tokenContract.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
    .map(tokenContract => ({
      id: tokenContract.id,
      label: tokenContract.name,
      type
    }))
    .concat(
      tokenContractByAddress
        ? [
          {
            id: tokenContractByAddress.id,
            label: tokenContractByAddress.name,
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

export const getTokenContractBySymbol = (symbol: string, tezosNetwork: TezosNetwork): TokenContract => {
  if (!symbol) {
    return undefined
  }

  return getTokenContracts(tezosNetwork).data.find(tokenContract => tokenContract.symbol === symbol)
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
    protocolIdentifier: 'btc'
  }
}

export const hasTokenHolders = (contract: TokenContract): boolean => ['STKR', 'tzBTC', 'USDtz', 'weCHF', 'ETHtz', 'wXTZ'].includes(contract.symbol)

export interface TokenHolder {
  address: string
  amount: string
}

const normalizeParameters = async (faProtocol: TezosFAProtocol, parameters: string, fallbackEntrypoint?: string): Promise<TezosTransactionParameters> => {
  try {
    return await faProtocol.normalizeTransactionParameters(parameters, fallbackEntrypoint)
  } catch {
    return {
      entrypoint: "default",
      value: null
    }
  }
}

const transactionDetailsFromParameters = async (faProtocol: TezosFAProtocol, parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]> => {
  try {
    return faProtocol.transactionDetailsFromParameters(parameters)
  } catch {
    return []
  }
}

// fills in Transaction entities which are contract's transfers properties: source, destination, amount from airgap
export const fillTransferOperations = async (
  transactions: Transaction[],
  chainNetworkService: ChainNetworkService,
  onNoAssetValue = (transaction: Transaction) => transaction,
  tokenContract?: TokenContract
): Promise<Transaction[]> => {
  if (isEmptyArray(transactions)) {
    return []
  }
  let result: Transaction[] = []
  for (const transaction of transactions) {
    const contract: TokenContract = tokenContract ?? getTokenContractByAddress(transaction.destination, chainNetworkService.getNetwork())

    if (contract && transaction.kind === OperationTypes.Transaction && transaction.parameters_micheline) {
      const faProtocol = getFaProtocol(contract, chainNetworkService.getEnvironment(), chainNetworkService.getNetwork())
      const normalizedParameters = await normalizeParameters(faProtocol, transaction.parameters_micheline, transaction.parameters_entrypoints)
      if (normalizedParameters.entrypoint !== 'transfer') {
        result.push(onNoAssetValue(transaction))
        continue
      }
      const details = await transactionDetailsFromParameters(faProtocol, normalizedParameters)
      const transactionDetails = details.map(detail => {
        if (detail === undefined) {
          return onNoAssetValue(transaction)
        }
        return {
          ...transaction,
          source: first(detail.from),
          destination: first(detail.to),
          amount: parseFloat(detail.amount),
          symbol: contract.symbol,
          decimals: contract.decimals
        } as Transaction
      })
      result = result.concat(transactionDetails)
    } else {
      result.push(onNoAssetValue(transaction))
    }
  }
  return result.filter(item => item !== undefined && item !== null)
}

// by default Transaction doesn't have symbol property, symbol is added by fillTransferOperations function
export const isAsset = (transaction: Transaction): boolean => !!transaction.symbol
