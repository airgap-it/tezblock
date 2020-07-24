import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Store } from '@ngrx/store'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { ActivatedRoute } from '@angular/router'

import { ProposalDetailComponent } from './proposal-detail.component'
import { initialState as pdInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import * as fromRoot from '@tezblock/reducers'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { CopyService } from 'src/app/services/copy/copy.service'
import { getCopyServiceMock } from 'src/app/services/copy/copy.service.mock'
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'
import { PeriodKind } from '@tezblock/domain/vote'

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent
  let fixture: ComponentFixture<ProposalDetailComponent>
  let storeMock: MockStore<any>
  let store: Store<fromRoot.State>
  let testScheduler: TestScheduler
  const initialState = { proposalDetails: pdInitialState, app: appInitialState }
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const copyServiceMock = getCopyServiceMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ProposalDetailComponent, AliasPipe, IconPipe],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Actions, useValue: EMPTY },
        AliasPipe,
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: CopyService, useValue: copyServiceMock },
        IconPipe,
        ShortenStringPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected))

    fixture = TestBed.createComponent(ProposalDetailComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
    store = TestBed.inject(Store)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    describe('periodTimespan$', () => {
      it('does not emmit value when periodKind & periodsTimespans is not truthy', () => {
        testScheduler.run(({ expectObservable }) => {
          expectObservable(component.periodTimespan$).toBe('---')
        })
      })

      it('returns periodsTimespan based on periodKind value', () => {
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            periodKind: PeriodKind.Exploration,
            periodsTimespans: [10, 20]
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: 20 }

          expectObservable(component.periodTimespan$).toBe(expected, expectedValues)
        })
      })
    })

    xdescribe('noDataLabel$', () => {

    })
  })
})
