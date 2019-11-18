export const environment = {
  production: true,
  mainnet: {
    rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
    conseilUrl: 'https://conseil-prod.cryptonomic-infra.tech',
    conseilApiKey: 'CONSEIL_API_KEY',
    targetUrl: 'https://' + 'MAINNET_CONSEIL_URL'
  },
  carthagenet: {
    rpcUrl: 'https://tezos-carthagenet-node-1.kubernetes.papers.tech',
    conseilUrl: 'https://tezos-carthagenet-conseil-1.kubernetes.papers.tech',
    conseilApiKey: 'CONSEIL_API_KEY',
    targetUrl: 'https://carthagenet.' + 'MAINNET_CONSEIL_URL'
  },

  babylonnet: {
    rpcUrl: 'https://tezos-dev.cryptonomic-infra.tech',
    conseilUrl: 'https://conseil-dev.cryptonomic-infra.tech',
    conseilApiKey: 'CONSEIL_API_KEY',
    targetUrl: 'https://babylonnet.' + 'MAINNET_CONSEIL_URL'
  },
  conseilBaseUrl: 'CONSEIL_BASE_URL',
  proFontAwesomeAvailable: false
}
