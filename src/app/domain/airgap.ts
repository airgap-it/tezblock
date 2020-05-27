import { getProtocolByIdentifier, ICoinProtocol, TezosFAProtocol } from 'airgap-coin-lib'

import { TokenContract } from '@tezblock/domain/contract'
import { EnvironmentUrls } from '@tezblock/services/base.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

export enum Currency {
  BTC = 'BTC',
  USD = 'USD',
  XTZ = 'XTZ'
}

const convertSymbol = (symbol: string): string => {
  switch (symbol) {
    // case 'tzBTC':
    //   return 'xtz-btc'
    case 'BTC':
    case 'tzBTC':
      return 'btc'
    default:
      return symbol
  }
}

export const tryGetProtocolByIdentifier = (identifier: string): ICoinProtocol => {
  try {
    return getProtocolByIdentifier(convertSymbol(identifier))
  } catch (e) {
    return undefined
  }
}

export const isConvertableToUSD = (symbol: string): boolean => ['xtz', 'tzBTC', 'BTC'].includes(symbol)

export const isInBTC = (symbol: string): boolean => ['tzBTC', 'BTC'].includes(symbol)

export const getFaProtocol = (
  contract: TokenContract,
  chainNetworkService: ChainNetworkService,
  environmentUrls: EnvironmentUrls
): TezosFAProtocol => {
  return new TezosFAProtocol({
    symbol: contract.symbol,
    name: contract.name,
    marketSymbol: contract.symbol,
    identifier: '', // not important in this context can be empty string
    contractAddress: contract.id,
    jsonRPCAPI: environmentUrls.rpcUrl,
    baseApiUrl: environmentUrls.conseilUrl,
    baseApiKey: environmentUrls.conseilApiKey,
    baseApiNetwork: chainNetworkService.getEnvironmentVariable(),
    network: chainNetworkService.getNetwork(),
    feeDefaults: {
      low: '0',
      medium: '0',
      high: '0'
    }
  })
}
