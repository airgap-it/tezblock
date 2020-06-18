import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { of } from 'rxjs'

import { BakingService } from './baking.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'
import { getCacheServiceMock } from '@tezblock/services/cache/cache.service.mock'
import { Baker } from 'src/app/interfaces/TezosBakerResponse'

describe('BakingService', () => {
  let service: BakingService
  let httpMock: HttpTestingController
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const cacheServiceMock = getCacheServiceMock()
  const fakeBaker: Baker = {
    voting: 'fake_voting',
    rank: 0,
    baker_name: 'fake_baker_name',
    delegation_code: 'fake_delegation_code',
    fee: '0',
    baker_efficiency: '0',
    available_capacity: '0',
    accepting_delegation: '0',
    nominal_staking_yield: '0'
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: CacheService, useValue: cacheServiceMock }
      ]
    })

    service = TestBed.inject(BakingService)
    httpMock = TestBed.get(HttpTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getTezosBakerInfos', () => {
    it('requests CacheKeys.fromCurrentCycle', () => {
      service.getTezosBakerInfos('fake_address')

      expect(cacheServiceMock.get).toHaveBeenCalledWith(CacheKeys.fromCurrentCycle)
    })

    it('when cache returns myTezosBaker then does not make http request for it', done => {
      const fakeCurrentCycleCache = {
        myTezosBaker: {
          bakers: [fakeBaker]
        }
      }

      cacheServiceMock.get.and.returnValue(of(fakeCurrentCycleCache))

      service.getTezosBakerInfos(fakeBaker.delegation_code).then(response => {
        expect(response).toEqual({
          status: 'success',
          rating: fakeBaker.baker_efficiency,
          fee: fakeBaker.fee,
          myTB: fakeBaker.voting,
          baker_name: fakeBaker.baker_name,
          delegation_code: fakeBaker.delegation_code
        })
        httpMock.expectNone((<any>service).tezosBakerUrl)
        done()
      })
    })

    it('when cache does not return myTezosBaker then make http request for it', () => {
      cacheServiceMock.get.and.returnValue(of(undefined))

      service.getTezosBakerInfos(fakeBaker.delegation_code).then(response => {
        expect(response).toEqual({
          status: 'success',
          rating: fakeBaker.baker_efficiency,
          fee: fakeBaker.fee,
          myTB: fakeBaker.voting,
          baker_name: fakeBaker.baker_name,
          delegation_code: fakeBaker.delegation_code
        })
        httpMock.expectNone((<any>service).tezosBakerUrl)
      })

      const req = httpMock.expectOne((<any>service).tezosBakerUrl)
      expect(req.request.method).toBe('GET')
      req.flush({ bakers: [fakeBaker] })
    })

    it('when api returns TezosBakerInfos without requested data then returns { status: "error" }', () => {
      cacheServiceMock.get.and.returnValue(of(undefined))

      service.getTezosBakerInfos('yet_another_fake_address').then(response => {
        expect(response).toEqual({
          status: 'error'
        })
        httpMock.expectNone((<any>service).tezosBakerUrl)
      })

      const req = httpMock.expectOne((<any>service).tezosBakerUrl)
      expect(req.request.method).toBe('GET')
      req.flush({ bakers: [fakeBaker] })
    })
  })
})
