import { convertSymbol } from './airgap';
import { getTokenContractBySymbol } from '@tezblock/domain/contract';
import {
  BitcoinProtocol,
  MainProtocolSymbols,
  TezosNetwork,
  TezosProtocol,
} from '@airgap/coinlib-core';

export const getDecimalsForSymbol = (
  symbol: string,
  network: TezosNetwork
): number => {
  const protocolSymbol = convertSymbol(symbol);

  switch (protocolSymbol) {
    case MainProtocolSymbols.XTZ:
      return new TezosProtocol().decimals;
    case MainProtocolSymbols.BTC:
      return new BitcoinProtocol().decimals;
    default:
      return getTokenContractBySymbol(symbol, network).decimals ?? 0;
  }
};
