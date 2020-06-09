import { getProtocolByIdentifier, ICoinProtocol, TezosFAProtocol } from 'airgap-coin-lib'
import { TokenContract } from '@tezblock/domain/contract'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

export enum Currency {
  BTC = 'BTC',
  USD = 'USD',
  XTZ = 'XTZ'
}

const convertSymbol = (symbol: string): string => {
  switch (symbol) {
    case 'BTC':
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
  chainNetworkService: ChainNetworkService
): TezosFAProtocol => {
  const environmentUrls = chainNetworkService.getEnvironment()

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

// (1,000,000 mutez = 1 tez/XTZ)
export const xtzToMutezConvertionRatio = 1000000
