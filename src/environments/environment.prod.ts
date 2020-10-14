export const environment = {
  production: true,
  mainnet: {
    rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
    conseilUrl: 'https://tezos-mainnet-conseil.prod.gke.papers.tech',
    conseilApiKey: 'airgap00391',
    targetUrl: 'https://mvp.tezblock.io'
  },
  carthagenet: {
    rpcUrl: 'https://tezos-carthagenet-node.prod.gke.papers.tech',
    conseilUrl: 'https://tezos-carthagenet-conseil.prod.gke.papers.tech',
    conseilApiKey: 'airgap00391',
    targetUrl: 'https://carthagenet.tezblock.io'
  },
  googleAnalyticsKey: undefined,
  proFontAwesomeAvailable: true
}
