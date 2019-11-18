// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
