// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { TezosNetwork } from "@airgap/coinlib-core";

export const environment = {
  production: false,
  [TezosNetwork.MAINNET]: {
    rpcUrl: 'MAINNET_RPC_URL',
    conseilUrl: 'MAINNET_CONSEIL_URL',
    conseilApiKey: 'MAINNET_CONSEIL_API_KEY',
    targetUrl: 'MAINNET_TARGET_URL'
  },
  [TezosNetwork.FLORENCENET]: {
    rpcUrl: 'FLORENCENET_RPC_URL',
    conseilUrl: 'FLORENCENET_CONSEIL_URL',
    conseilApiKey: 'FLORENCENET_CONSEIL_API_KEY',
    targetUrl: 'FLORENCENET_TARGET_URL'
  },
  [TezosNetwork.GRANADANET]: {
    rpcUrl: 'GRANADANET_RPC_URL',
    conseilUrl: 'GRANADANET_CONSEIL_URL',
    conseilApiKey: 'GRANADANET_CONSEIL_API_KEY',
    targetUrl: 'GRANADANET_TARGET_URL'
  },
  googleAnalyticsKey: undefined,
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
