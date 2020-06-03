import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { Actions } from '@ngrx/effects'
import { EMPTY, Subject } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ToastrService } from 'ngx-toastr'
import { BreakpointObserver } from '@angular/cdk/layout'

import { AccountDetailComponent } from './account-detail.component'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { initialState as adInitialState } from './reducer'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { AccountService } from '@tezblock/services/account/account.service'
import { getAccountServiceMock } from '@tezblock/services/account/account.service.mock'
import { BakingService } from '@tezblock/services/baking/baking.service'
import { getBakingServiceMock } from '@tezblock/services/baking/baking.service.mock'
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { getCryptoPricesServiceMock } from '@tezblock/services/crypto-prices/crypto-prices.service.mock'
import { CurrencyConverterPipe } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { CopyService } from '@tezblock/services/copy/copy.service'
import { getCopyServiceMock } from '@tezblock/services/copy/copy.service.mock'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { getToastrServiceMock } from 'test-config/mocks/toastr-service.mock'
import { getPipeMock } from 'test-config/mocks/pipe.mock'
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe'
import { getBreakpointObserverMock } from 'test-config/mocks/breakpoint-observer.mock'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { getRewardAmountMinusFee } from '@tezblock/domain/reward'
import { getBsModalServiceMock } from 'test-config/mocks/bs-modal-service.mock'

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent
  let fixture: ComponentFixture<AccountDetailComponent>
  let testScheduler: TestScheduler
  let storeMock: MockStore<any>
  const initialState = { accountDetails: adInitialState, app: appInitialState }
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const activatedRouteMock = getActivatedRouteMock()
  const accountServiceMock = getAccountServiceMock()
  const bakingServiceMock = getBakingServiceMock()
  const cryptoPricesServiceMock = getCryptoPricesServiceMock()
  const currencyConverterPipeMock = getPipeMock()
  const bsModalServiceMock = getBsModalServiceMock()
  const copyServiceMock = getCopyServiceMock()
  const aliasPipeMock = getPipeMock()
  const toastrServiceMock = getToastrServiceMock()
  const iconPipeMock = getPipeMock()
  const breakpointObserverMock = getBreakpointObserverMock()

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })

    TestBed.configureTestingModule({
        providers: [
          provideMockStore({ initialState }),
          { provide: Actions, useValue: EMPTY },
          { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          { provide: AccountService, useValue: accountServiceMock },
          { provide: BakingService, useValue: bakingServiceMock },
          { provide: CryptoPricesService, useValue: cryptoPricesServiceMock },
          { provide: CurrencyConverterPipe, useValue: currencyConverterPipeMock },
          { provide: BsModalService, useValue: bsModalServiceMock },
          { provide: CopyService, useValue: copyServiceMock },
          { provide: AliasPipe, useValue: aliasPipeMock },
          { provide: ToastrService, useValue: toastrServiceMock },
          { provide: IconPipe, useValue: iconPipeMock },
          { provide: BreakpointObserver, useValue: breakpointObserverMock }
        ],
        imports: [],
        declarations: [
          AccountDetailComponent,
        ]
      })

    fixture = TestBed.createComponent(AccountDetailComponent)
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

    describe('rewardAmountMinusFee$', () => {
      it('should not trigger when account is not set', () => {
        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = '---'

          expectObservable(component.rewardAmountMinusFee$).toBe(expected)
        })
      })

      describe('when account is baker', () => {
        let _initialState

        beforeEach(() => {
          _initialState = {
            ...initialState,
            accountDetails: {
              ...initialState.accountDetails,
              account: {
                is_baker: true
              }
            }
          }
        })

        it('and bakerReward.payout is number as string, then should calculate from bakerReward.payout', () => {
          const payoutValue = '44'
  
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              bakerReward: {
                payout: payoutValue
              }
            }
          })
  
          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: parseFloat(payoutValue) }
  
            expectObservable(component.rewardAmountMinusFee$).toBe(expected, expectedValues)
          })
        })

        it('and bakerReward is undefined, then should return undefined', () => {
          storeMock.setState(_initialState)

          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: undefined }
  
            expectObservable(component.rewardAmountMinusFee$).toBe(expected, expectedValues)
          })
        })

        it('and bakerReward is not truthy and not undefined, then should return null', () => {
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              bakerReward: ''
            }
          })

          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: null }
  
            expectObservable(component.rewardAmountMinusFee$).toBe(expected, expectedValues)
          })
        })
      })

      describe('when account is NOT baker', () => {
        let _initialState

        beforeEach(() => {
          _initialState = {
            ...initialState,
            accountDetails: {
              ...initialState.accountDetails,
              account: {
                is_baker: false
              }
            }
          }
        })

        it('and both: rewardAmount and tezosBakerFee are not truthy, then should return null', () => {

          // case when only rewardAmount is falsy
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              tezosBakerFee: 8
            }
          })
  
          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: null }
  
            expectObservable(component.rewardAmountMinusFee$).toBe(expected, expectedValues)
          })
        })

        it('then calculates value from rewardAmount & tezosBakerFee', () => {
          const rewardAmount = '4'
          const tezosBakerFee = 8

          // case when only rewardAmount is falsy
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              rewardAmount,
              tezosBakerFee
            }
          })
  
          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: getRewardAmountMinusFee(parseFloat(rewardAmount), tezosBakerFee) }
  
            expectObservable(component.rewardAmountMinusFee$).toBe(expected, expectedValues)
          })
        })

      })
    })

    describe('isRewardAmountMinusFeeBusy$', () => {

      it('should not trigger when account is not set', () => {
        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = '---'

          expectObservable(component.rewardAmountMinusFee$).toBe(expected)
        })
      })

      it('when account is baker, then returns busy.bakerReward', () => {
    
        storeMock.setState({
          ...initialState,
          accountDetails: {
            ...initialState.accountDetails,
            account: {
              is_baker: true
            },
            busy: {
              bakerReward: true
            }
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: true }

          expectObservable(component.isRewardAmountMinusFeeBusy$).toBe(expected, expectedValues)
        })
      })

      describe('when account is NOT baker', () => {
        let _initialState

        beforeEach(() => {
          _initialState = {
            ...initialState,
            accountDetails: {
              ...initialState.accountDetails,
              account: {
                is_baker: false
              }
            }
          }
        })

        it('then is busy(TRUE) when rewardAmont is not null & tezosBakerFee is undefined', () => {
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              rewardAmount: 7
            }
          })
  
          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: true }
  
            expectObservable(component.isRewardAmountMinusFeeBusy$).toBe(expected, expectedValues)
          })
        })

        it('then is busy(TRUE) when rewardAmont is not null & isRewardAmontBusy', () => {
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              rewardAmount: 7,
              busy: {
                rewardAmont: true
              }
            }
          })
  
          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: true }
  
            expectObservable(component.isRewardAmountMinusFeeBusy$).toBe(expected, expectedValues)
          })
        })

        it('then is not busy(FALSE) when rewardAmont is null', () => {
          storeMock.setState({
            ..._initialState,
            accountDetails: {
              ..._initialState.accountDetails,
              rewardAmount: null
            }
          })
  
          testScheduler.run(helpers => {
            const { expectObservable } = helpers
            const expected = 'a'
            const expectedValues = { a: false }
  
            expectObservable(component.isRewardAmountMinusFeeBusy$).toBe(expected, expectedValues)
          })
        })

      })
    })

    describe('tezosBakerFeeLabel$', () => {

      it('when tezosBakerFee is truthy, then returns tezosBakerFee + %', () => {
        storeMock.setState({
          ...initialState,
          accountDetails: {
            ...initialState.accountDetails,
            tezosBakerFee: 4
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: '4 %' }

          expectObservable(component.tezosBakerFeeLabel$).toBe(expected, expectedValues)
        })
      })

      it('when tezosBakerFee is null, then returns not available', () => {
        storeMock.setState({
          ...initialState,
          accountDetails: {
            ...initialState.accountDetails,
            tezosBakerFee: null
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: 'not available' }

          expectObservable(component.tezosBakerFeeLabel$).toBe(expected, expectedValues)
        })
      })

      it('otherwise returns undefined', () => {
        storeMock.setState({
          ...initialState,
          accountDetails: {
            ...initialState.accountDetails,
            tezosBakerFee: ''
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: undefined }

          expectObservable(component.tezosBakerFeeLabel$).toBe(expected, expectedValues)
        })
      })
    })

    describe('numberOfContractAssets$', () => {
      it('counts contractAssets by theris unique names', () => {
        storeMock.setState({
          ...initialState,
          accountDetails: {
            ...initialState.accountDetails,
            contractAssets: {
              data: [
                { contract: { name: 'A' } },
                { contract: { name: 'A' } },
                { contract: { name: 'B' } },
                { contract: { name: 'B' } },
                { contract: { name: 'C' } },
                { contract: { name: 'C' } }
              ]
            }
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: 3 }

          expectObservable(component.numberOfContractAssets$).toBe(expected, expectedValues)
        })
      })
    })

    // describe('contractAssetsBalance$', () => {

    // })

  })
})
