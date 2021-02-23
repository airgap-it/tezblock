import { FeeDefaults, ProtocolSymbols, TezosFA2ProtocolConfig } from "@airgap/coinlib-core";

export class WetziKoinProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'CHF',
    name: string = 'WetziKoin',
    marketSymbol: string = 'CHF',
    identifier: ProtocolSymbols = 'xtz-wtk' as ProtocolSymbols,
    contractAddress: string = 'KT1SovvF5KRQjBiVX8cHFmEoMc7H54ehxstV',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.300',
      high: '0.500'
    },
    decimals: number = 2,
    tokenID: number = 0,
    tokenMetadataBigMapID: number = 107,
    tokenMetadataBigMapName: string = 'tokens'
  ) {
    super(
      symbol,
      name,
      marketSymbol,
      identifier,
      contractAddress,
      feeDefaults,
      decimals,
      tokenID,
      tokenMetadataBigMapID,
      tokenMetadataBigMapName
    )
  }
}