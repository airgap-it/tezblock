import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { negate, isNil, get } from 'lodash'
import BigNumber from 'bignumber.js'
import { forkJoin, from, Observable, of } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'

import { Pageable } from '@tezblock/domain/table'
import { SearchOption, SearchOptionType } from '@tezblock/services/search/model'
import { get as fpGet, first, isEmptyArray } from '@tezblock/services/fp'
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { ExchangeRates } from '@tezblock/services/cache/cache.service'
import { Currency, isInBTC, getFaProtocol } from '@tezblock/domain/airgap'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { OperationTypes } from '@tezblock/domain/operations'
import { TezosFA12Protocol } from 'airgap-coin-lib/dist/protocols/tezos/fa/TezosFA12Protocol'
import { TezosTransactionParameters } from 'airgap-coin-lib/dist/protocols/tezos/types/operations/Transaction'
import { IAirGapTransaction } from 'airgap-coin-lib'

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

export const hasTokenHolders = (contract: TokenContract): boolean => ['Staker', 'tzBTC'].includes(contract.name)

export interface TokenHolder {
  address: string
  amount: string
}

const normalizeParameters = async (faProtocol: TezosFA12Protocol, parameters: string, fallbackEntrypoint?: string): Promise<TezosTransactionParameters> => {
  try {
    return await faProtocol.normalizeTransactionParameters(parameters, fallbackEntrypoint)
  } catch {
    return {
      entrypoint: "default",
      value: null
    }
  }
}

const transactionDetailsFromParameters = async (faProtocol: TezosFA12Protocol, parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]> => {
  try {
    return await faProtocol.transactionDetailsFromParameters(parameters)
  } catch {
    return []
  }
}

// fills in Transaction entities which are contract's transfers properties: source, destination, amount from airgap
export const fillTransferOperations = (
  transactions: Transaction[],
  chainNetworkService: ChainNetworkService,
  onNoAssetValue = (transaction: Transaction) => transaction,
  tokenContract?: TokenContract
): Observable<Transaction[]> => {
  if (isEmptyArray(transactions)) {
    return of([])
  }

  return forkJoin(
    transactions.map(transaction => {
      const contract: TokenContract = tokenContract ?? getTokenContractByAddress(transaction.destination, chainNetworkService.getNetwork())

      if (contract && transaction.kind === OperationTypes.Transaction && (transaction.parameters_micheline ?? transaction.parameters)) {
        const faProtocol = getFaProtocol(contract, chainNetworkService.getEnvironment(), chainNetworkService.getNetwork())
        
        return from(normalizeParameters(faProtocol, transaction.parameters_micheline ?? transaction.parameters, transaction.parameters_entrypoints)).pipe(
          switchMap(normalizedParameters => {
            if (normalizedParameters.entrypoint === 'transfer') {
              return from(
                transactionDetailsFromParameters(faProtocol, normalizedParameters)
              ).pipe(
                map(first),
                map(details => {
                  if (details === undefined) {
                    return onNoAssetValue(transaction)
                  }
                  return {
                    ...transaction,
                    source: first(details.from),
                    destination: first(details.to),
                    amount: parseFloat(details.amount),
                    symbol: contract.symbol,
                    decimals: contract.decimals
                  }
                })
              )
            }

            return of(onNoAssetValue(transaction))
          })
        )
      }

      return of(onNoAssetValue(transaction))
    })
  ).pipe(map(transactions => {
    return transactions.filter(negate(isNil))
  }))
}

// by default Transaction doesn't have symbol property, symbol is added by fillTransferOperations function
export const isAsset = (transaction: Transaction): boolean => !!transaction.symbol
