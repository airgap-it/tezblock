export const environment = {
  production: true,
  mainnet: {
    rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
    conseilUrl: 'https://tezos-mainnet-conseil-1.kubernetes.papers.tech',
    conseilApiKey: 'airgap123',
    targetUrl: 'https://tezblock.io'
  },
  carthagenet: {
    rpcUrl: 'https://tezos-carthagenet-node-1.kubernetes.papers.tech',
    conseilUrl: 'https://tezos-carthagenet-conseil-1.kubernetes.papers.tech',
    conseilApiKey: 'airgap00391',
    targetUrl: 'https://carthagenet.tezblock.io'
  },

  babylonnet: {
    rpcUrl: 'https://tezos-babylonnet-node-1.kubernetes.papers.tech',
    conseilUrl: 'https://tezos-babylonnet-conseil-1.kubernetes.papers.tech',
    conseilApiKey: 'airgap00391',
    targetUrl: 'https://babylonnet.tezblock.io'
  },
  proFontAwesomeAvailable: true
}
