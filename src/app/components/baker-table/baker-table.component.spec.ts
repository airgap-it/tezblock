import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { EMPTY } from 'rxjs'
import { Actions } from '@ngrx/effects'
import { ActivatedRoute } from '@angular/router'

import { BakerTableComponent } from './baker-table.component'
import { initialState as btInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { initialState as adInitialState } from '@tezblock/pages/account-detail/reducer'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { getRewardServiceMock } from '@tezblock/services/reward/reward.service.mock'
import { OperationTypes } from '@tezblock/domain/operations'

describe('BakerTableComponent', () => {
  let component: BakerTableComponent
  let fixture: ComponentFixture<BakerTableComponent>
  let storeMock: MockStore<any>
  let testScheduler: TestScheduler
  const initialState = { accountDetails: adInitialState, bakerTable: btInitialState, app: appInitialState }
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const rewardServiceMock = getRewardServiceMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: RewardService, useValue: rewardServiceMock }
      ],
      declarations: [BakerTableComponent]
    })

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })

    fixture = TestBed.createComponent(BakerTableComponent)
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

    describe('isRightsTabAvailable$', () => {
      it('when upcomingRights is not truthy then returns true', () => {
        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: true }

          expectObservable(component.isRightsTabAvailable$).toBe(expected, expectedValues)
        })
      })

      it('when selectedTab.kind is "baking_rights" and upcomingRights.baking is truthy then returns true', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              baking: 'foo'
            }
          }
        })

        component.selectedTab = {
          kind: OperationTypes.BakingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false
        }

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: true }

          expectObservable(component.isRightsTabAvailable$).toBe(expected, expectedValues)
        })
      })

      it('when selectedTab.kind is "baking_rights" and upcomingRights.baking is not truthy then returns false', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              baking: null
            }
          }
        })

        component.selectedTab = {
          kind: OperationTypes.BakingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false
        }

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: false }

          expectObservable(component.isRightsTabAvailable$).toBe(expected, expectedValues)
        })
      })

      it('when selectedTab.kind is NOT "baking_rights" and upcomingRights.endorsing is truthy then returns true', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              endorsing: 'foo'
            }
          }
        })

        component.selectedTab = {
          kind: OperationTypes.EndorsingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false
        }

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: true }

          expectObservable(component.isRightsTabAvailable$).toBe(expected, expectedValues)
        })
      })

      it('when selectedTab.kind is NOT "baking_rights" and upcomingRights.endorsing is NOT truthy then returns false', () => {
        storeMock.setState({
          ...initialState,
          bakerTable: {
            ...initialState.bakerTable,
            upcomingRights: {
              endorsing: null
            }
          }
        })

        component.selectedTab = {
          kind: OperationTypes.EndorsingRights,
          title: null,
          active: true,
          count: 1,
          disabled: () => false
        }

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: false }

          expectObservable(component.isRightsTabAvailable$).toBe(expected, expectedValues)
        })
      })
    })
  })

  xdescribe('getRewardsInnerDataSource', () => {

  })
})
