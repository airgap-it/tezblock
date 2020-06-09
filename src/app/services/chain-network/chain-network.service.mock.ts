import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

export const getChainNetworkServiceMock = () => jasmine.createSpyObj('ChainNetworkService', {
    getNetwork: TezosNetwork.MAINNET
})
