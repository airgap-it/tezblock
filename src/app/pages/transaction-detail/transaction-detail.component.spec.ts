import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'

import { TransactionDetailComponent } from './transaction-detail.component'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { initialState as tdInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent
  let fixture: ComponentFixture<TransactionDetailComponent>
  let storeMock: MockStore<any>
  const initialState = { app: appInitialState, transactionDetails: tdInitialState }
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const activatedRouteMock = getActivatedRouteMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        AliasPipe,
        IconPipe,
        ShortenStringPipe
      ],
      imports: [],
      declarations: [TransactionDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(TransactionDetailComponent)
    storeMock = TestBed.get(MockStore)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
