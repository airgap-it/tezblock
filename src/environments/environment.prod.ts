import { TezosNetwork } from '@airgap/coinlib-core';

export const environment = {
  production: true,
  [TezosNetwork.MAINNET]: {
    rpcUrl: 'MAINNET_RPC_URL',
    conseilUrl: 'MAINNET_CONSEIL_URL',
    conseilApiKey: 'MAINNET_CONSEIL_API_KEY',
    targetUrl: 'MAINNET_TARGET_URL',
  },
  [TezosNetwork.ITHACANET]: {
    rpcUrl: 'ITHACANET_RPC_URL',
    conseilUrl: 'ITHACANET_CONSEIL_URL',
    conseilApiKey: 'ITHACANET_CONSEIL_API_KEY',
    targetUrl: 'ITHACANET_TARGET_URL',
  },
  googleAnalyticsKey: undefined,
  proFontAwesomeAvailable: false,
};
