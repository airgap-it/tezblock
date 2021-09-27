import { TezosNetwork } from '@airgap/coinlib-core';

export const environment = {
  production: true,
  [TezosNetwork.MAINNET]: {
    rpcUrl: 'MAINNET_RPC_URL',
    conseilUrl: 'MAINNET_CONSEIL_URL',
    conseilApiKey: 'MAINNET_CONSEIL_API_KEY',
    targetUrl: 'MAINNET_TARGET_URL',
  },
  [TezosNetwork.GRANADANET]: {
    rpcUrl: 'GRANADANET_RPC_URL',
    conseilUrl: 'GRANADANET_CONSEIL_URL',
    conseilApiKey: 'GRANADANET_CONSEIL_API_KEY',
    targetUrl: 'GRANADANET_TARGET_URL',
  },
  googleAnalyticsKey: undefined,
  proFontAwesomeAvailable: false,
};
