import { BitcoinProtocol, TezosProtocol } from 'airgap-coin-lib'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { MainProtocolSymbols, SubProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'

import { convertSymbol } from './airgap'
import { getTokenContractBySymbol } from '@tezblock/domain/contract'

export const getDecimalsForSymbol = (symbol: string, network: TezosNetwork): number => {
  const protocolSymbol = convertSymbol(symbol)

  switch (protocolSymbol) {
    case MainProtocolSymbols.XTZ:
      return new TezosProtocol().decimals
    case MainProtocolSymbols.BTC:
      return new BitcoinProtocol().decimals
    default:
      return getTokenContractBySymbol(symbol, network).decimals ?? 0
  }
}
