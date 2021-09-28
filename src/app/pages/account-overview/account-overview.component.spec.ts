import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { Actions } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AccountOverviewComponent } from './account-overview.component';
import { initialState as aoInitialState } from './reducer';
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe';
import { getPipeMock } from 'test-config/mocks/pipe.mock';
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe';
import {
  getBreakpointObserverMock,
  getObserveValue,
} from 'test-config/mocks/breakpoint-observer.mock';
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe';
import {
  TranslateService,
  TranslateModule,
  TranslatePipe,
} from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';

describe('AccountOverviewComponent', () => {
  let component: AccountOverviewComponent;
  let fixture: ComponentFixture<AccountOverviewComponent>;
  let testScheduler: TestScheduler;
  let storeMock: MockStore<any>;
  const initialState = { accountsList: aoInitialState };
  const aliasPipeMock = getPipeMock();
  const amountConverterPipeMock = getPipeMock();
  const breakpointObserverMock = getBreakpointObserverMock();
  const shortenStringPipeMock = getPipeMock();

  beforeEach(async(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);
    });

    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AccountOverviewComponent, TranslatePipe],
      imports: [TranslateModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        { provide: Actions, useValue: EMPTY },
        { provide: AliasPipe, useValue: aliasPipeMock },
        { provide: AmountConverterPipe, useValue: amountConverterPipeMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        { provide: ShortenStringPipe, useValue: shortenStringPipeMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: TranslatePipe, useClass: TranslatePipeMock },
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOverviewComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    describe('top25ChartLabels$', () => {
      beforeEach(() => {
        component.ngOnInit();
      });

      it('when top25Accounts is NOT array then does not emit', () => {
        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = '---';

          expectObservable(component.top25ChartLabels$).toBe(expected);
        });
      });

      it('uses aliasPipe as main pipe', () => {
        storeMock.setState({
          ...initialState,
          accountsList: {
            ...initialState.accountsList,
            top25Accounts: [{ account_id: '111' }, { account_id: '222' }],
          },
        });

        aliasPipeMock.transform.and.returnValue('AAA');
        shortenStringPipeMock.transform.and.returnValue('BBB');

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: ['AAA -', 'AAA -'] };

          expectObservable(component.top25ChartLabels$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('uses shortenStringPipe as secondary pipe', () => {
        storeMock.setState({
          ...initialState,
          accountsList: {
            ...initialState.accountsList,
            top25Accounts: [{ account_id: '111' }, { account_id: '222' }],
          },
        });

        aliasPipeMock.transform.and.returnValue(undefined);
        shortenStringPipeMock.transform.and.returnValue('BBB');

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: ['BBB -', 'BBB -'] };

          expectObservable(component.top25ChartLabels$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });

    describe('top25ChartSize$', () => {
      it('when Breakpoints.Small, Breakpoints.Handset are emited returns small size', () => {
        breakpointObserverMock.observe.and.returnValue(
          of(getObserveValue(true))
        );
        component.ngOnInit();

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = '(a|)';
          const expectedValues = { a: { width: 200, height: 200 } };

          expectObservable(component.top25ChartSize$).toBe(
            expected,
            expectedValues
          );
        });
      });

      it('when NOT Breakpoints.Small, Breakpoints.Handset are emited returns big size', () => {
        breakpointObserverMock.observe.and.returnValue(
          of(getObserveValue(false))
        );
        component.ngOnInit();

        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = '(a|)';
          const expectedValues = { a: { width: 800, height: 500 } };

          expectObservable(component.top25ChartSize$).toBe(
            expected,
            expectedValues
          );
        });
      });
    });
  });
});
