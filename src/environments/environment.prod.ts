export const environment = {
  production: true,
  mainnet: {
    rpc: 'https://tezos-node.prod.gke.papers.tech',
    conseil: 'https://conseil-prod.cryptonomic-infra.tech'
  },
  carthagenet: {
    rpc: 'https://tezos-carthagenet-node-1.kubernetes.papers.tech',
    conseil: 'https://tezos-carthagenet-conseil-1.kubernetes.papers.tech'
  },

  babylonnet: {
    rpc: 'https://tezos-dev.cryptonomic-infra.tech',
    conseil: 'https://conseil-dev.cryptonomic-infra.tech'
  },
  conseilBaseUrl: 'CONSEIL_BASE_URL',
  conseilApiKey: 'CONSEIL_API_KEY',
  proFontAwesomeAvailable: false
}
