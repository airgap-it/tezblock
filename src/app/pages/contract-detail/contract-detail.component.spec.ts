import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { Actions } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import * as moment from 'moment'

import { ContractDetailComponent } from './contract-detail.component'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { AccountService } from '@tezblock/services/account/account.service'
import { getAccountServiceMock } from '@tezblock/services/account/account.service.mock'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { initialState as cdInitialState } from './reducer'
import { OperationTab } from './actions'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'
import { SocialType, Social } from '@tezblock/domain/contract'

describe('ContractDetailComponent', () => {
  let component: ContractDetailComponent
  let fixture: ComponentFixture<ContractDetailComponent>
  let storeMock: MockStore<any>
  let testScheduler: TestScheduler
  const accountServiceMock = getAccountServiceMock()
  const activatedRouteMock = getActivatedRouteMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const initialState = { contractDetails: cdInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContractDetailComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        IconPipe,
        AliasPipe,
        ShortenStringPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected))

    fixture = TestBed.createComponent(ContractDetailComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    describe('hasAlias$', () => {
      it('when address in falsy then returns address value(undefined/false)', () => {
        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: undefined }

          expectObservable(component.hasAlias$).toBe(expected, expectedValues)
        })
      })

      it('when for given address is alias then returns true', () => {
        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            address: 'tz1LJycSuCT25AA5VJwNW1QYXVGyy7YLwZh9'
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: true }

          expectObservable(component.hasAlias$).toBe(expected, expectedValues)
        })
      })
    })

    describe('transactions$', () => {
      it('when kind is transfers then returns transfer operations', () => {
        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            currentTabKind: OperationTab.transfers,
            transferOperations: {
              ...initialState.contractDetails.transferOperations,
              data: ['foo']
            }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: ['foo'] }

          expectObservable(component.transactions$).toBe(expected, expectedValues)
        })
      })

      it('when kind is other then returns other operations', () => {
        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            currentTabKind: OperationTab.other,
            otherOperations: {
              ...initialState.contractDetails.otherOperations,
              data: ['foo']
            }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: ['foo'] }

          expectObservable(component.transactions$).toBe(expected, expectedValues)
        })
      })

      it('when kind is tokenHolders then returns paged tokenHolder operations', () => {
        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            currentTabKind: OperationTab.tokenHolders,
            tokenHolders: {
              ...initialState.contractDetails.tokenHolders,
              data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }

          expectObservable(component.transactions$).toBe(expected, expectedValues)
        })
      })
    })

    describe('showFiatValue$', () => {
      it('when contract is falsy then return (contract)falsy value', () => {
        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: undefined }

          expectObservable(component.showFiatValue$).toBe(expected, expectedValues)
        })
      })

      it('when contract is convertable to USD then returns true', () => {
        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            contract: { symbol: 'tzBTC' }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: true }

          expectObservable(component.showFiatValue$).toBe(expected, expectedValues)
        })
      })
    })

    describe('transactions24hCount$', () => {
      it('counts transactions number from last 24h', () => {
        const transferA = {
          timestamp: moment()
            .add(-25, 'hours')
            .valueOf()
        }
        const transferB = {
          timestamp: moment()
            .add(-20, 'hours')
            .valueOf()
        }
        const transferC = {
          timestamp: moment()
            .add(-3, 'hours')
            .valueOf()
        }

        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            transferOperations: {
              ...initialState.contractDetails.transferOperations,
              data: [transferA, transferB, transferC]
            }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: 2 }

          expectObservable(component.transactions24hCount$).toBe(expected, expectedValues)
        })
      })
    })

    describe('transactions24hVolume$', () => {
      it('sum transactions from last 24h amount', () => {
        const transferA = {
          timestamp: moment()
            .add(-25, 'hours')
            .valueOf(),
          amount: 10
        }
        const transferB = {
          timestamp: moment()
            .add(-20, 'hours')
            .valueOf(),
          amount: 10
        }
        const transferC = {
          timestamp: moment()
            .add(-3, 'hours')
            .valueOf(),
          amount: 10
        }

        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            transferOperations: {
              ...initialState.contractDetails.transferOperations,
              data: [transferA, transferB, transferC]
            }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: 20 }

          expectObservable(component.transactions24hVolume$).toBe(expected, expectedValues)
        })
      })
    })

    describe('getSocial', () => {
      it('when no contract then does not emit value', () => {
        testScheduler.run(({ expectObservable }) => {
          expectObservable((<any>component).getSocial(() => true)).toBe('---')
        })
      })

      it('findts contract social by condition', () => {
        storeMock.setState({
          ...initialState,
          contractDetails: {
            ...initialState.contractDetails,
            contract: {
              socials: [{ type: SocialType.github, url: 'foo_url_1' }, { type: SocialType.medium, url: 'foo_url_2' }]
            }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = { a: 'foo_url_2' }

          expectObservable((<any>component).getSocial((social: Social) => social.type === SocialType.medium)).toBe(expected, expectedValues)
        })
      })
    })
  })
})
