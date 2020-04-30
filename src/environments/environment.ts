// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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
  googleAnalyticsKey: undefined,
  proFontAwesomeAvailable: true
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
