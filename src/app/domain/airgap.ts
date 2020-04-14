import { getProtocolByIdentifier, ICoinProtocol } from 'airgap-coin-lib'

export enum Currency {
  BTC = 'BTC',
  USD = 'USD',
  XTZ = 'XTZ'
}

const convertSymbol = (symbol: string): string => {
  switch (symbol) {
    // case 'tzBTC':
    //   return 'xtz-btc'
    case 'STKR':
      return 'stkr' // xtz ?
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
