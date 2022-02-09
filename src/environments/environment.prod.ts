import { TezosNetwork } from '@airgap/coinlib-core';

export const environment = {
  production: true,
  [TezosNetwork.MAINNET]: {
    rpcUrl: 'MAINNET_RPC_URL',
    conseilUrl: 'MAINNET_CONSEIL_URL',
    conseilApiKey: 'MAINNET_CONSEIL_API_KEY',
    targetUrl: 'MAINNET_TARGET_URL',
  },
  [TezosNetwork.HANGZHOUNET]: {
    rpcUrl: 'HANGZHOUNET_RPC_URL',
    conseilUrl: 'HANGZHOUNET_CONSEIL_URL',
    conseilApiKey: 'HANGZHOUNET_CONSEIL_API_KEY',
    targetUrl: 'HANGZHOUNET_TARGET_URL',
  },
  googleAnalyticsKey: undefined,
  proFontAwesomeAvailable: false,
};
