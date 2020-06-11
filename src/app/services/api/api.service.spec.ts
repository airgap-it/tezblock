import { TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

import { ApiService } from './api.service'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { ProtocolVariablesService } from '@tezblock/services/protocol-variables/protocol-variables.service'
import { getProtocolVariablesServiceMock } from '@tezblock/services/protocol-variables/protocol-variables.service.mock'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { getRewardServiceMock } from '@tezblock/services/reward/reward.service.mock'

describe('ApiService', () => {
  let service: ApiService
  let storeMock: MockStore<any>
  let httpMock: HttpTestingController
  const initialState = { app: appInitialState }
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const protocolVariablesServiceMock = getProtocolVariablesServiceMock()
  const rewardServiceMock = getRewardServiceMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: ProtocolVariablesService, useValue: protocolVariablesServiceMock },
        { provide: RewardService, useValue: rewardServiceMock },
        ApiService
      ]
    })

    service = TestBed.inject(ApiService)
    storeMock = TestBed.inject(MockStore)
    httpMock = TestBed.inject(HttpTestingController);
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
