import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { Store } from '@ngrx/store'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { ActivatedRoute } from '@angular/router'

import { ProposalDetailComponent } from './proposal-detail.component'
import { initialState as pdInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { CopyService } from 'src/app/services/copy/copy.service'
import { getCopyServiceMock } from 'src/app/services/copy/copy.service.mock'
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent
  let fixture: ComponentFixture<ProposalDetailComponent>
  let storeMock: MockStore<any>
  let store: Store<fromRoot.State>
  const initialState = { proposalDetails: pdInitialState, app: appInitialState }
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const copyServiceMock = getCopyServiceMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ProposalDetailComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Actions, useValue: EMPTY },
        AliasPipe,
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: CopyService, useValue: copyServiceMock },
        IconPipe,
        ShortenStringPipe
      ]
    })

    fixture = TestBed.createComponent(ProposalDetailComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
    store = TestBed.inject(Store)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  // TODO: fix
  xdescribe('startLoadingVotes', () => {
    let dispatchSpy: jasmine.Spy

    beforeEach(() => {
      dispatchSpy = spyOn(store, 'dispatch')
      component.tabs = [{ title: 'foo', active: true, count: 1, kind: 'fooKind', disabled: () => false }]
    })

    describe('when is loaded proposal and is id in url address ', () => {
      beforeEach(() => {
       
      })

      it('and query has tab info then call action startLoadingVotes with that tab', () => {
        activatedRouteMock.snapshot.queryParamMap.get.and.returnValue('foo')

        component.ngOnInit()

        activatedRouteMock.paramMap.next(getParamMapValue('1'))
        storeMock.setState({
          ...initialState,
          proposalDetails: {
            ...initialState.proposalDetails,
            proposal: 'whatever'
          }
        })

        expect(dispatchSpy.calls.all()[1].args[0]).toEqual(actions.startLoadingVotes({ periodKind: 'fooKind' }))
      })
    })
  })
})
