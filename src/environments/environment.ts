// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mainnet: {
    rpcUrl: 'MAINNET_RPC_URL',
    conseilUrl: 'MAINNET_CONSEIL_URL',
    conseilApiKey: 'MAINNET_CONSEIL_API_KEY',
    targetUrl: 'https://' + 'TEZBLOCK_URL'
  },
  carthagenet: {
    rpcUrl: 'CARTHAGENET_RPC_URL',
    conseilUrl: 'CARTHAGENET_CONSEIL_URL',
    conseilApiKey: 'CARTHAGENET_CONSEIL_API_KEY',
    targetUrl: 'https://carthagenet.' + 'TEZBLOCK_URL'
  },

  babylonnet: {
    rpcUrl: 'BABYLONNET_RPC_URL',
    conseilUrl: 'BABYLONNET_CONSEIL_URL',
    conseilApiKey: 'BABYLONNET_CONSEIL_API_KEY',
    targetUrl: 'https://babylonnet.' + 'TEZBLOCK_URL'
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
