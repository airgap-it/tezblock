import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Actions } from '@ngrx/effects'
import { of, Subject } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'

import { ApiService } from '@tezblock/services/api/api.service'
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { BlockDetailComponent } from './block-detail.component'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { initialState as bdInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import * as actions from './actions'
import { getPipeMock } from 'test-config/mocks/pipe.mock'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { TranslateService } from '@ngx-translate/core'

describe('BlockDetailComponent', () => {
  let fixture: ComponentFixture<BlockDetailComponent>
  let component: BlockDetailComponent
  let storeMock: MockStore<any>
  let testScheduler: TestScheduler
  const actionsMock = <Actions>of({ type: 'Action One' })
  const apiServiceMock = getApiServiceMock()
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const iconPipeMock = getPipeMock()
  const initialState = { blockDetails: bdInitialState, app: appInitialState }

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: actionsMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: IconPipe, useValue: iconPipeMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: TranslateService, useValue: TranslateService }
      ],
      declarations: [BlockDetailComponent]
    })

    fixture = TestBed.createComponent(BlockDetailComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    describe('numberOfConfirmations$', () => {
      it('on initial state doesnt emit value', () => {
        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = '---'

          expectObservable(component.numberOfConfirmations$).toBe(expected)
        })
      })

      it('on blocks set returns theirs level difference', () => {
        storeMock.setState({
          ...initialState,
          app: {
            ...initialState.app,
            latestBlock: { level: 2 }
          },
          blockDetails: {
            ...initialState.blockDetails,
            block: { level: 1 }
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: 1 }

          expectObservable(component.numberOfConfirmations$).toBe(expected, expectedValues)
        })
      })
    })

    it('on route change should create Load Block action', () => {
      const mockedBlockId = 'mockedBlockId'

      spyOn(storeMock, 'dispatch').and.callThrough()
      activatedRouteMock.paramMap.next(getParamMapValue(mockedBlockId))

      expect(storeMock.dispatch).toHaveBeenCalledWith(actions.loadBlock({ id: mockedBlockId }))
    })
  })
})
