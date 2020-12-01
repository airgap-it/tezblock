import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ProgressbarConfig } from 'ngx-bootstrap/progressbar'
import { MomentModule } from 'ngx-moment'
import { Actions } from '@ngrx/effects'
import { EMPTY, pipe } from 'rxjs'

import { DashboardComponent } from './dashboard.component'
import { initialState as dInitialState } from './reducer'
import { initialState as appInitialState } from '@tezblock/app.reducer'
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock'
import { ApiService } from '@tezblock/services/api/api.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { bind, numberToDate, multiplyBy } from '@tezblock/services/fp'
import { PricePeriod } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { PeriodKind } from '@tezblock/domain/vote'
import { TranslateService, TranslateModule, TranslatePipe } from '@ngx-translate/core'
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub'
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock'

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>
  let testScheduler: TestScheduler
  let storeMock: MockStore<any>
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const initialState = { dashboard: dInitialState, app: appInitialState }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgressbarConfig,
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: getApiServiceMock() },
        { provide: Actions, useValue: EMPTY },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock }
      ],
      imports: [MomentModule, TranslateModule.forRoot()],
      declarations: [BaseChartDirective, DashboardComponent, TranslatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })

    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })

    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })

  describe('priceChartLabels$', () => {
    const _16July2020 = 1594896276868
    const getPriceChartLabels = (toString: (any) => string) => pipe(multiplyBy(1000), numberToDate, bind(toString))

    beforeEach(() => {
      storeMock.setState({
        ...initialState,
        dashboard: {
          ...initialState.dashboard,
          cryptoHistoricData: [
            {
              time: _16July2020 / 1000
            }
          ]
        }
      })
    })

    it('when pricePeriod is 0 then uses toLocaleTimeString', () => {
      const _getPriceChartLabels = getPriceChartLabels(Date.prototype.toLocaleTimeString)

      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a'
        const expectedValues = { a: [_getPriceChartLabels(_16July2020 / 1000)] }

        expectObservable(component.priceChartLabels$).toBe(expected, expectedValues)
      })
    })

    it('when pricePeriod is NOT 0 then uses toLocaleDateString', () => {
      const _getPriceChartLabels = getPriceChartLabels(Date.prototype.toLocaleDateString)

      component.pricePeriod$.next(PricePeriod.week)
      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a'
        const expectedValues = { a: [_getPriceChartLabels(_16July2020 / 1000)] }

        expectObservable(component.priceChartLabels$).toBe(expected, expectedValues)
      })
    })
  })

  describe('proposalHash$', () => {
    it('does not emit value when proposal or currentVotingPeriod is not truthy', () => {
      storeMock.setState({
        ...initialState,
        app: {
          ...initialState.app,
          currentVotingPeriod: 1
        }
      })

      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = '---'

        expectObservable(component.proposalHash$).toBe(expected)
      })
    })

    it('when active_proposal of latestBlock is null then returns null', () => {
      storeMock.setState({
        ...initialState,
        app: {
          ...initialState.app,
          latestBlock: {
            active_proposal: null
          }
        }
      })

      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a'
        const expectedValues = { a: null }

        expectObservable(component.proposalHash$).toBe(expected, expectedValues)
      })
    })

    it('when active_proposal of latestBlock is not null then returns propoal without brackets', () => {
      storeMock.setState({
        ...initialState,
        app: {
          ...initialState.app,
          latestBlock: {
            active_proposal: 'foo'
          }
        }
      })

      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a'
        const expectedValues = { a: 'foo' }

        expectObservable(component.proposalHash$).toBe(expected, expectedValues)
      })
    })
  })

  describe('showRolls$', () => {
    it('when latestBlock is truthy and atestBlock.period_kind is Exploration or Promotion and yayRolls is not undefined then returns true', () => {
      storeMock.setState({
        ...initialState,
        dashboard: {
          ...initialState.dashboard,
          divisionOfVotes: [{ max_yay_rolls: 5 }, { max_yay_rolls: 8 }]
        },
        app: {
          ...initialState.app,
          latestBlock: {
            period_kind: PeriodKind.Exploration
          }
        }
      })

      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a'
        const expectedValues = { a: true }

        expectObservable(component.showRolls$).toBe(expected, expectedValues)
      })
    })

    it('otherwise returns false', () => {
      storeMock.setState({
        ...initialState,
        dashboard: {
          ...initialState.dashboard,
          divisionOfVotes: [{ max_yay_rolls: 5 }, { max_yay_rolls: 8 }]
        },
        app: {
          ...initialState.app,
          latestBlock: {
            period_kind: PeriodKind.Testing
          }
        }
      })

      component.ngOnInit()

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a'
        const expectedValues = { a: false }

        expectObservable(component.showRolls$).toBe(expected, expectedValues)
      })
    })
  })
})
