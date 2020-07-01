import { TestBed } from '@angular/core/testing'
import { NetworkType } from '@airgap/beacon-sdk'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { BeaconService } from './beacon.service'
import { getDAppClientMock } from 'test-config/mocks/d-app-client.mock'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'

describe('BeaconService', () => {
  let service: BeaconService
  const dAppClientMock = getDAppClientMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ChainNetworkService, useValue: chainNetworkServiceMock }]
    })

    service = TestBed.get(BeaconService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('delegate', () => {
    beforeEach(() => {
      spyOn(service, 'getDAppClient').and.returnValue(dAppClientMock)
    })

    describe('when account in not active', () => {
      beforeEach(() => {
        dAppClientMock.getActiveAccount.and.returnValue(Promise.resolve(false))
      })

      it('then calls DAppClient.requestPermissions', done => {
        chainNetworkServiceMock.getNetwork.and.returnValue(TezosNetwork.MAINNET)

        service.delegate('foo').then(() => {
          expect(dAppClientMock.requestPermissions).toHaveBeenCalledWith(undefined)

          done()
        })
      })

      it('and network is not MAINNET then calls DAppClient.requestPermissions with object', done => {
        const argument = {
          network: {
            type: NetworkType.CARTHAGENET
          }
        }

        chainNetworkServiceMock.getNetwork.and.returnValue(TezosNetwork.CARTHAGENET)

        service.delegate('foo').then(() => {
          expect(dAppClientMock.requestPermissions).toHaveBeenCalledWith(argument)

          done()
        })
      })
    })

    it('when account in active, then does not call DAppClient.requestPermissions', done => {
      dAppClientMock.getActiveAccount.and.returnValue(Promise.resolve(true))
      dAppClientMock.requestPermissions.calls.reset()

      service.delegate('foo').then(() => {
        expect(dAppClientMock.requestPermissions).not.toHaveBeenCalled()

        done()
      })
    })
  })
})

// how to override es6 class import by mock ? ...
// possible solution: https://www.npmjs.com/package/ts-mock-imports
