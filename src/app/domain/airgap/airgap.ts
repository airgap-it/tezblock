import { $enum } from 'ts-enum-util';
import { pipe } from 'rxjs';

import { TokenContract } from '@tezblock/domain/contract';
import { EnvironmentUrls } from '@tezblock/domain/generic/environment-urls';
import { bind, get } from '@tezblock/services/fp';
import {
  MainProtocolSymbols,
  NetworkType,
  ProtocolSymbols,
  SubProtocolSymbols,
  TezosFA1p2Protocol,
  TezosFA2Protocol,
  TezosFA2ProtocolConfig,
  TezosFA2ProtocolOptions,
  TezosFAProtocol,
  TezosFAProtocolConfig,
  TezosFAProtocolOptions,
  TezosNetwork,
  TezosProtocol,
  TezosProtocolNetwork,
  TezosProtocolNetworkExtras,
  TezosProtocolOptions,
} from '@airgap/coinlib-core';

export enum Currency {
  BTC = 'BTC',
  USD = 'USD',
  XTZ = 'XTZ',
}

export const convertSymbol = (symbol: string): ProtocolSymbols => {
  const standarizeSymbol = (symbol: string): string => {
    switch (symbol) {
      case 'stkr':
        return SubProtocolSymbols.XTZ_STKR;
      case 'tzbtc':
        return SubProtocolSymbols.XTZ_BTC;
      case 'usdtz':
        return SubProtocolSymbols.XTZ_USD;
      case 'you':
        return SubProtocolSymbols.XTZ_YOU;
      case 'uusd':
        return SubProtocolSymbols.XTZ_UUSD;
      default:
        return symbol;
    }
  };
  const toSymbolKey = pipe(
    bind(String.prototype.toLowerCase),
    standarizeSymbol
  );
  const _symbol = get<string>((value) => toSymbolKey(value))(symbol);

  return (
    $enum(MainProtocolSymbols).asValueOrDefault(_symbol, undefined) ||
    $enum(SubProtocolSymbols).asValueOrDefault(_symbol, undefined)
  );
};

export const isConvertableToUSD = (symbol: string): boolean =>
  ['xtz', 'tzBTC', 'BTC'].includes(symbol);

export const isInBTC = (symbol: string): boolean =>
  ['tzBTC', 'BTC'].includes(symbol);

const getTezosProtocolNetwork = (
  environmentUrls: EnvironmentUrls,
  tezosNetwork: TezosNetwork
): TezosProtocolNetwork =>
  new TezosProtocolNetwork(
    tezosNetwork == TezosNetwork.MAINNET ? 'Mainnet' : 'Ithacanet',
    tezosNetwork == TezosNetwork.MAINNET
      ? NetworkType.MAINNET
      : NetworkType.TESTNET,
    environmentUrls.rpcUrl,
    undefined,
    new TezosProtocolNetworkExtras(
      tezosNetwork,
      environmentUrls.conseilUrl,
      TezosNetwork.MAINNET,
      environmentUrls.conseilApiKey
    )
  );

export const getTezosFAProtocolOptions = (
  contract: TokenContract,
  environmentUrls: EnvironmentUrls,
  tezosNetwork: TezosNetwork
): TezosFAProtocolOptions => {
  const feeDefaults = {
    low: '0',
    medium: '0',
    high: '0',
  };
  const config = new TezosFAProtocolConfig(
    contract.contractAddress,
    'xtz-fa2' as SubProtocolSymbols,
    contract.symbol,
    contract.name,
    contract.symbol,
    feeDefaults,
    contract.decimals
  );

  return new TezosFAProtocolOptions(
    getTezosProtocolNetwork(environmentUrls, tezosNetwork),
    config
  );
};

export const getTezosFA2ProtocolOptions = (
  contract: TokenContract,
  environmentUrls: EnvironmentUrls,
  tezosNetwork: TezosNetwork
): TezosFA2ProtocolOptions => {
  const feeDefaults = {
    low: '0',
    medium: '0',
    high: '0',
  };
  const config = new TezosFA2ProtocolConfig(
    contract.contractAddress,
    'xtz-fa2' as SubProtocolSymbols,
    contract.symbol,
    contract.name,
    contract.symbol,
    feeDefaults,
    contract.decimals ?? 0,
    contract.tokenId ?? 0,
    undefined,
    contract.ledgerBigMapID,
    undefined
  );

  return new TezosFA2ProtocolOptions(
    getTezosProtocolNetwork(environmentUrls, tezosNetwork),
    config
  );
};

const faProtocolCache = new Map<String, TezosFAProtocol>();

export const getFaProtocol = (
  contract: TokenContract,
  environmentUrls: EnvironmentUrls,
  tezosNetwork: TezosNetwork
): TezosFAProtocol => {
  let result = faProtocolCache.get(contract.id);

  if (!result) {
    result =
      contract.type && contract.type === 'fa2'
        ? new TezosFA2Protocol(
            getTezosFA2ProtocolOptions(contract, environmentUrls, tezosNetwork)
          )
        : new TezosFA1p2Protocol(
            getTezosFAProtocolOptions(contract, environmentUrls, tezosNetwork)
          );
    faProtocolCache.set(contract.id, result);
  }

  return result;
};

// (1,000,000 mutez = 1 tez/XTZ)
export const xtzToMutezConvertionRatio = 1000000;

export const getTezosProtocol = (
  environmentUrls: EnvironmentUrls,
  tezosNetwork: TezosNetwork
): TezosProtocol => {
  const options: TezosProtocolNetwork = getTezosProtocolNetwork(
    environmentUrls,
    tezosNetwork
  );

  return new TezosProtocol(new TezosProtocolOptions(options));
};
