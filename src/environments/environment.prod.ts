export const environment = {
  production: true,
  mainnet: {
    rpcUrl: 'MAINNET_RPC_URL',
    conseilUrl: 'MAINNET_CONSEIL_URL',
    conseilApiKey: 'MAINNET_CONSEIL_API_KEY',
    targetUrl: 'https://' + 'TEZBLOCK_DOMAIN'
  },
  carthagenet: {
    rpcUrl: 'CARTHAGENET_RPC_URL',
    conseilUrl: 'CARTHAGENET_CONSEIL_URL',
    conseilApiKey: 'CARTHAGENET_CONSEIL_API_KEY',
    targetUrl: 'https://carthagenet.' + 'TEZBLOCK_DOMAIN'
  },

  babylonnet: {
    rpcUrl: 'BABYLONNET_RPC_URL',
    conseilUrl: 'BABYLONNET_CONSEIL_URL',
    conseilApiKey: 'BABYLONNET_CONSEIL_API_KEY',
    targetUrl: 'https://babylonnet.' + 'TEZBLOCK_DOMAIN'
  },
  proFontAwesomeAvailable: false
}
