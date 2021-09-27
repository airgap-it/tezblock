import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import BigNumber from 'bignumber.js';

import { AmountCellComponent, getPrecision } from './amount-cell.component';
import { CurrencyConverterPipe } from '@tezblock/pipes/currency-converter/currency-converter.pipe';
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe';
import { getPipeMock } from 'test-config/mocks/pipe.mock';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service';
import { getCryptoPricesServiceMock } from '@tezblock/services/crypto-prices/crypto-prices.service.mock';
import { ChartDataService } from '@tezblock/services/chartdata/chartdata.service';
import { getChartDataServiceMock } from '@tezblock/services/chartdata/chartdata.service.mock';

describe('getPrecision', () => {
  it('when value equals 0 or has no decimal value then returns "1.0-0"', () => {
    expect(getPrecision('0')).toBe('1.0-0');
    expect(getPrecision('13.0000')).toBe('1.0-0');
  });

  it('otherwise when is passed digitsInfo then returns it', () => {
    expect(getPrecision('123.495', { digitsInfo: 'foo' })).toBe('foo');
  });

  it('otherwise when value is less than 0 then returns "1.2-8"', () => {
    expect(getPrecision('0.00000376')).toBe('1.2-8');
  });

  it('otherwise returns "1.2-2"', () => {
    expect(getPrecision('1.386')).toBe('1.2-2');
  });
});

describe('AmountCellComponent', () => {
  let component: AmountCellComponent;
  let fixture: ComponentFixture<AmountCellComponent>;
  let testScheduler: TestScheduler;
  let changeDetectorRef: ChangeDetectorRef;
  const cryptoPricesServiceMock = getCryptoPricesServiceMock();
  const chartDataServiceMock = getChartDataServiceMock();
  const initialState = { app: appInitialState };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AmountCellComponent],
      providers: [
        provideMockStore({ initialState }),
        ChangeDetectorRef,
        CurrencyConverterPipe,
        AmountConverterPipe,
        { provide: CryptoPricesService, useValue: cryptoPricesServiceMock },
        { provide: ChartDataService, useValue: chartDataServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    fixture = TestBed.createComponent(AmountCellComponent);
    component = fixture.componentInstance;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('currencyAmount$', () => {
    it('when getCurrencyConverterArgs returns undefined then does not emit value', () => {
      cryptoPricesServiceMock.getCurrencyConverterArgs.and.returnValue(
        of(undefined)
      );

      component.ngOnInit();

      testScheduler.run(({ expectObservable }) => {
        const expected = '---';

        expectObservable(component.currencyAmount$).toBe(expected);
      });
    });

    it('when data is not truthy then does not emit value', () => {
      cryptoPricesServiceMock.getCurrencyConverterArgs.and.returnValue(
        of('foo')
      );

      component.ngOnInit();

      testScheduler.run(({ expectObservable }) => {
        const expected = '---';

        expectObservable(component.currencyAmount$).toBe(expected);
      });
    });

    it('applies decimals from airgap getProtocolByIdentifier', () => {
      cryptoPricesServiceMock.getCurrencyConverterArgs.and.returnValue(
        of({
          currInfo: {
            symbol: 'tzBTC',
            currency: 'USD',
            price: new BigNumber(10),
          },
          protocolIdentifier: 'BTC',
        })
      );

      component.data = '13';
      component.ngOnInit();

      testScheduler.run(({ expectObservable }) => {
        const expected = 'a';
        const expectedValues = { a: (13 / Math.pow(10, 7)).toString() };

        expectObservable(component.currencyAmount$).toBe(
          expected,
          expectedValues
        );
      });
    });
  });

  describe('setAmountPiped', () => {
    it('shifts decimals using symbol', () => {
      component.data = '13.786';
      component.options = { symbol: 'tzBTC' };
      (<any>component).setAmountPiped();

      expect(component.amountPipedLeadingChars).toBe('0');
      expect(component.amountPipedTrailingChars).toBe('00000014');
    });

    it('adds thousand separators', () => {
      component.data = '10000';
      component.options = { symbol: 'STKR' };
      (<any>component).setAmountPiped();

      expect(component.amountPipedLeadingChars).toBe('10,000');
      expect(component.amountPipedTrailingChars).toBe(undefined);
    });

    it('when value is greater or equal to 1000 then removes decimals', () => {
      component.data = '1000.187';
      component.options = { symbol: 'STKR' };
      (<any>component).setAmountPiped();

      expect(component.amountPipedLeadingChars).toBe('1,000');
      expect(component.amountPipedTrailingChars).toBe(undefined);
    });

    it('when value is NOT greater or equal to 1000 then removes decimals', () => {
      component.data = '999.187';
      component.options = { symbol: 'STKR' };
      (<any>component).setAmountPiped();

      expect(component.amountPipedLeadingChars).toBe('999');
      expect(component.amountPipedTrailingChars).toBe('19');
    });
  });
});
