import { BreakpointObserver } from '@angular/cdk/layout'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { BsModalService } from 'ngx-bootstrap/modal'
import { ToastrService } from 'ngx-toastr'
import { EMPTY } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'

import { TranslateService, TranslatePipe } from '@ngx-translate/core'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { initialState as adInitialState } from './reducer'
import { initialState as btInitialState } from '@tezblock/components/baker-table/reducer'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { getRewardAmountMinusFee } from '@tezblock/domain/reward'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'
import { AccountService } from '@tezblock/services/account/account.service'
import { getAccountServiceMock } from '@tezblock/services/account/account.service.mock'
import { BakingService } from '@tezblock/services/baking/baking.service'
import { getBakingServiceMock } from '@tezblock/services/baking/baking.service.mock'
import { BeaconService } from '@tezblock/services/beacon/beacon.service'
import { getBeaconServiceMock } from '@tezblock/services/beacon/beacon.service.mock'
import { CopyService } from '@tezblock/services/copy/copy.service'
import { getCopyServiceMock } from '@tezblock/services/copy/copy.service.mock'
import { getActivatedRouteMock, getParamMapValue } from 'test-config/mocks/activated-route.mock'
import { getBreakpointObserverMock } from 'test-config/mocks/breakpoint-observer.mock'
import { getBsModalServiceMock } from 'test-config/mocks/bs-modal-service.mock'
import { getPipeMock } from 'test-config/mocks/pipe.mock'
import { getToastrServiceMock } from 'test-config/mocks/toastr-service.mock'
import { AccountDetailComponent } from './account-detail.component'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent
  let fixture: ComponentFixture<AccountDetailComponent>
  let testScheduler: TestScheduler
  let storeMock: MockStore<any>
  const initialState = { accountDetails: adInitialState, app: appInitialState, bakerTable: btInitialState }
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const activatedRouteMock = getActivatedRouteMock()
  const accountServiceMock = getAccountServiceMock()
  const bakingServiceMock = getBakingServiceMock()
  const bsModalServiceMock = getBsModalServiceMock()
  const copyServiceMock = getCopyServiceMock()
  const aliasPipeMock = getPipeMock()
  const toastrServiceMock = getToastrServiceMock()
  const iconPipeMock = getPipeMock()
  const breakpointObserverMock = getBreakpointObserverMock()
  const beaconServiceMock = getBeaconServiceMock()

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
        { provide: BsModalService, useValue: bsModalServiceMock },
        { provide: CopyService, useValue: copyServiceMock },
        { provide: AliasPipe, useValue: aliasPipeMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: IconPipe, useValue: iconPipeMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
        { provide: BeaconService, useValue: beaconServiceMock },
        ShortenStringPipe
      ],
      imports: [],
      declarations: [AccountDetailComponent, TranslatePipe]
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
    //   it('when contractAssets are empty then returns 0', () => {
    //     storeMock.setState({
    //       ...initialState,
    //       accountDetails: {
    //         ...initialState.accountDetails,
    //         contractAssets: { data: [] }
    //       }
    //     })

    //     testScheduler.run(helpers => {
    //       const { expectObservable } = helpers
    //       const expected = 'a'
    //       const expectedValues = { a: 0 }

    //       expectObservable(component.contractAssetsBalance$).toBe(expected, expectedValues)
    //     })
    //   })

    //   describe('when contractAssets are NOT empty', () => {
    //     const asset1 = { contract: { amount: 1, symbol: 'tzBTC' } }
    //     const asset2 = { contract: { amount: 2, symbol: 'STKR' } }
    //     const asset3 = { contract: { amount: 3, symbol: 'xtz' } }

    //     beforeEach(() => {
    //       storeMock.setState({
    //         ...initialState,
    //         accountDetails: {
    //           ...initialState.accountDetails,
    //           contractAssets: { data: [asset1, asset2, asset3] }
    //         }
    //       })
    //     })

    //     it('then cryptoPricesService.getCurrencyConverterArgs is called with convertable contracts symbol', () => {
    //       component.contractAssetsBalance$.subscribe(() => {})

    //       expect(cryptoPricesServiceMock.getCurrencyConverterArgs.calls.all()[0].args[0]).toEqual(asset1.contract.symbol)
    //       expect(cryptoPricesServiceMock.getCurrencyConverterArgs.calls.all()[1].args[0]).toEqual(asset3.contract.symbol)
    //     })

    //     it('returns sum of currencyConverterPipe.transform only for concertable to $ assets', () => {
    //       cryptoPricesServiceMock.getCurrencyConverterArgs.and.returnValue(of('mocked currencyConverterArgs'))
    //       currencyConverterPipeMock.transform.and.returnValue(4)

    //       testScheduler.run(helpers => {
    //         const { expectObservable } = helpers
    //         const expected = 'a'
    //         const expectedValues = { a: 8 }

    //         expectObservable(component.contractAssetsBalance$).toBe(expected, expectedValues)
    //       })
    //     })
    //   })
    // })

    describe('rightsPerBlockLevel$', () => {
      it('when any of: latestBlock, firstBlockOfCurrentCycle, protocolVariables, bakingRights, endorsingRights is empty then does not trigger', () => {
        testScheduler.run(({ expectObservable }) => {
          expectObservable(component.rightsPerBlockLevel$).toBe('---')
        })
      })

      it('creates ranges by 6 levels but not exceedes last level of cycle', () => {
        storeMock.setState({
          ...initialState,
          app: {
            ...initialState.app,
            latestBlock: { level: 3 },
            firstBlockOfCurrentCycle: { level: 1, meta_cycle: 6 },
            protocolVariables: { blocks_per_cycle: 8 }
          },
          bakerTable: {
            ...initialState.bakerTable,
            bakingRights: { data: [{ cycle: 6, bakingRewardsDetails: [{ level: 5 }] }] },
            endorsingRights: { data: [{ cycle: 7 }] }
          }
        })

        testScheduler.run(({ expectObservable }) => {
          const expected = 'a'
          const expectedValues = {
            a: [
              {
                isInFuture: 0,
                from: 1,
                to: 6,
                endorsements: undefined,
                bakes: 1
              },
              {
                isInFuture: 1,
                from: 7,
                to: 8,
                endorsements: undefined,
                bakes: 0
              }
            ]
          }

          expectObservable(component.rightsPerBlockLevel$).toBe(expected, expectedValues)
        })
      })
    })
  })
})
