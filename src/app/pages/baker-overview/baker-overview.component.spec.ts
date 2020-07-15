import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { TestScheduler } from 'rxjs/testing'
import { Actions } from '@ngrx/effects'
import { EMPTY, of } from 'rxjs'
import { BreakpointObserver } from '@angular/cdk/layout'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { BakerOverviewComponent } from './baker-overview.component'
import { initialState as boInitialState } from './reducer'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { getPipeMock } from 'test-config/mocks/pipe.mock'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { getBreakpointObserverMock, getObserveValue } from 'test-config/mocks/breakpoint-observer.mock'
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { HttpClient } from '@angular/common/http'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

describe('BakerOverviewComponent', () => {
  let component: BakerOverviewComponent
  let fixture: ComponentFixture<BakerOverviewComponent>
  let testScheduler: TestScheduler
  let storeMock: MockStore<any>
  const initialState = { bakers: boInitialState }
  const aliasPipeMock = getPipeMock()
  const amountConverterPipeMock = getPipeMock()
  const breakpointObserverMock = getBreakpointObserverMock()

  function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json')
  }

  beforeEach(async(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })

    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [BakerOverviewComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: AliasPipe, useValue: aliasPipeMock },
        { provide: AmountConverterPipe, useValue: amountConverterPipeMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        TranslateService
      ]
    })
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BakerOverviewComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    describe('top24ChartLabels$', () => {
      beforeEach(() => {
        component.ngOnInit()
      })

      it('when top24Bakers is NOT array then does not emit', () => {
        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = '---'

          expectObservable(component.top24ChartLabels$).toBe(expected)
        })
      })

      it('when top24Bakers pkh is "Others" then  returns "Others -"', () => {
        storeMock.setState({
          ...initialState,
          bakers: {
            top24Bakers: [{ pkh: 'Others' }, { pkh: 'Others' }]
          }
        })

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: ['Others -', 'Others -'] }

          expectObservable(component.top24ChartLabels$).toBe(expected, expectedValues)
        })
      })

      it('when aliasPipe.transform of top24Bakers.pkh has value then uses it', () => {
        storeMock.setState({
          ...initialState,
          bakers: {
            top24Bakers: [{ pkh: 'A' }, { pkh: 'B' }]
          }
        })

        aliasPipeMock.transform.and.returnValue('FOO')

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: ['FOO -', 'FOO -'] }

          expectObservable(component.top24ChartLabels$).toBe(expected, expectedValues)
        })
      })

      it('when aliasPipe.transform of top24Bakers.pkh has NO value then uses top24Bakers.pkh', () => {
        storeMock.setState({
          ...initialState,
          bakers: {
            top24Bakers: [{ pkh: 'A' }, { pkh: 'B' }]
          }
        })

        aliasPipeMock.transform.and.returnValue(undefined)

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = 'a'
          const expectedValues = { a: ['A -', 'B -'] }

          expectObservable(component.top24ChartLabels$).toBe(expected, expectedValues)
        })
      })
    })

    describe('top24ChartSize$', () => {
      it('when Breakpoints.Small, Breakpoints.Handset are emited returns small size', () => {
        breakpointObserverMock.observe.and.returnValue(of(getObserveValue(true)))
        component.ngOnInit()

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = '(a|)'
          const expectedValues = { a: { width: 200, height: 200 } }

          expectObservable(component.top24ChartSize$).toBe(expected, expectedValues)
        })
      })

      it('when NOT Breakpoints.Small, Breakpoints.Handset are emited returns big size', () => {
        breakpointObserverMock.observe.and.returnValue(of(getObserveValue(false)))
        component.ngOnInit()

        testScheduler.run(helpers => {
          const { expectObservable } = helpers
          const expected = '(a|)'
          const expectedValues = { a: { width: 800, height: 480 } }

          expectObservable(component.top24ChartSize$).toBe(expected, expectedValues)
        })
      })
    })
  })
})
