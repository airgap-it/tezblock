import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

export const getChainNetworkServiceMock = () =>
  jasmine.createSpyObj('ChainNetworkService', {
    getEnvironment: {
      rpcUrl: 'fake_rpcUrl',
      conseilUrl: 'fake_conseilUrl',
      conseilApiKey: 'fake_conseilUrl',
      targetUrl: 'fake_conseilUrl'
    },
    getEnvironmentVariable: TezosNetwork.MAINNET,
    getNetwork: TezosNetwork.MAINNET
  })
