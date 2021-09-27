import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';

import { AssetsValueComponent } from './assets-value.component';
import { initialState as appInitialState } from '@tezblock/app.reducer';

import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { getCryptoPricesServiceMock } from '@tezblock/services/crypto-prices/crypto-prices.service.mock';
import { CurrencyConverterPipe } from '@tezblock/pipes/currency-converter/currency-converter.pipe';
import { getPipeMock } from 'test-config/mocks/pipe.mock';

describe('AssetsValueComponent', () => {
  let component: AssetsValueComponent;
  let fixture: ComponentFixture<AssetsValueComponent>;
  let testScheduler: TestScheduler;
  let storeMock: MockStore<any>;
  const initialState = { app: appInitialState };
  const cryptoPricesServiceMock = getCryptoPricesServiceMock();
  const currencyConverterPipeMock = getPipeMock();

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected);
    });

    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState }),
        { provide: CryptoPricesService, useValue: cryptoPricesServiceMock },
        { provide: CurrencyConverterPipe, useValue: currencyConverterPipeMock },
      ],
      imports: [],
      declarations: [AssetsValueComponent],
    });

    fixture = TestBed.createComponent(AssetsValueComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('value$', () => {
      it('when assets are empty then returns 0', () => {
        testScheduler.run((helpers) => {
          const { expectObservable } = helpers;
          const expected = 'a';
          const expectedValues = { a: 0 };

          expectObservable(component.value$).toBe(expected, expectedValues);
        });
      });

      describe('when assets are NOT empty', () => {
        const asset1 = { value: 1, symbol: 'tzBTC' };
        const asset2 = { value: 2, symbol: 'STKR' };
        const asset3 = { value: 3, symbol: 'xtz' };

        beforeEach(() => {
          component.assets = [asset1, asset2, asset3];
        });

        it('then cryptoPricesService.getCurrencyConverterArgs is called with convertable symbol', () => {
          component.value$.subscribe(() => {});

          expect(
            cryptoPricesServiceMock.getCurrencyConverterArgs.calls.all()[0]
              .args[0]
          ).toEqual(asset1.symbol);
          expect(
            cryptoPricesServiceMock.getCurrencyConverterArgs.calls.all()[1]
              .args[0]
          ).toEqual(asset3.symbol);
        });

        it('returns sum of currencyConverterPipe.transform only for convertable to $ assets', () => {
          cryptoPricesServiceMock.getCurrencyConverterArgs.and.returnValue(
            of('mocked currencyConverterArgs')
          );
          currencyConverterPipeMock.transform.and.returnValue(4);

          testScheduler.run((helpers) => {
            const { expectObservable } = helpers;
            const expected = 'a';
            const expectedValues = { a: 8 };

            expectObservable(component.value$).toBe(expected, expectedValues);
          });
        });
      });
    });
  });
});
