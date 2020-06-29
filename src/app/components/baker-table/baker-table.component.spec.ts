import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { EMPTY } from 'rxjs'
import { Actions } from '@ngrx/effects'
import { ActivatedRoute } from '@angular/router'

import { BakerTableComponent } from './baker-table.component'
import { initialState as btInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { getRewardServiceMock } from '@tezblock/services/reward/reward.service.mock'
import { ApiService } from '@tezblock/services/api/api.service'
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock'

describe('BakerTableComponent', () => {
  let component: BakerTableComponent
  let fixture: ComponentFixture<BakerTableComponent>
  let storeMock: MockStore<any>
  const initialState = { bakerTable: btInitialState, app: appInitialState }
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const rewardServiceMock = getRewardServiceMock()
  const apiServiceMock = getApiServiceMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: RewardService, useValue: rewardServiceMock },
        { provide: ApiService, useValue: apiServiceMock }
      ],
      declarations: [BakerTableComponent]
    })

    fixture = TestBed.createComponent(BakerTableComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
