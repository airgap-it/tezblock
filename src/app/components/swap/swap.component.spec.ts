import { AccountInfo } from '@airgap/beacon-sdk';
import { SimpleChange } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import BigNumber from 'bignumber.js';
import { of } from 'rxjs';
import { getPipeMock } from 'test-config/mocks/pipe.mock';
import { IdenticonComponent } from '../identicon/identicon';
import { LiquidityInputComponent } from '../liquidity-input/liquidity-input.component';
import { MockTokenizedBitcoinCurrency } from './MockTokenizedBitcoinCurrency';
import { AbstractCurrency } from './swap-utils';
import { SwapComponent } from './swap.component';
import { TezosCurrency } from './TezosCurrency';

describe('SwapComponent', () => {
  let component: SwapComponent;
  let fixture: ComponentFixture<SwapComponent>;
  const initialState = { app: appInitialState };
  const iconPipeMock = getPipeMock();
  let storeMock: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: IconPipe, useValue: iconPipeMock },
      ],
      declarations: [
        SwapComponent,
        LiquidityInputComponent,
        IdenticonComponent,
        IconPipe,
      ],
    }).compileComponents();

    storeMock = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapComponent);
    component = fixture.componentInstance;
    initComponent();
  });

  function initComponent() {
    component.connectedWallet$ = of({
      address: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ',
    } as AccountInfo);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the correct swap values in the UI for a XTZ => Token swap', fakeAsync(async () => {
    component.fromCurrency = new TezosCurrency(storeMock);
    const toCurrencies = [new MockTokenizedBitcoinCurrency()];

    toCurrencies.forEach((currency) => {
      component.toCurrency = currency as AbstractCurrency;

      currency.tezAmounts.forEach((tezValue, idx) => {
        component.ngOnChanges({
          fromAmount: new SimpleChange(null, component.fromAmount, true),
        });
        component.fromAmount.setValue(tezValue);

        component.ngOnChanges({
          fromAmount: new SimpleChange(null, component.fromAmount, false),
        });
        fixture.detectChanges();
        tick(1000);

        component.selectedSlippage$.subscribe((slippage) => {
          const percentage = new BigNumber(100).div(
            new BigNumber(100).minus(slippage)
          );

          const formControlAmountSlippageAdjusted = new BigNumber(
            component.toAmount.value
          ).times(percentage);
          expect(formControlAmountSlippageAdjusted.toNumber()).toBe(
            currency.expectedXtzToTokenValues[idx]
          );
        });
      });
    });
  }));

  it('should set the correct form values in the UI for a Token => XTZ swap', fakeAsync(async () => {
    component.toCurrency = new TezosCurrency(storeMock);
    component.fromTez = false;

    const fromCurrencies = [new MockTokenizedBitcoinCurrency()];

    fromCurrencies.forEach((currency) => {
      component.fromCurrency = currency as AbstractCurrency;

      currency.tokenToTezAmounts.forEach((tokenAmount, idx) => {
        component.ngOnChanges({
          fromAmount: new SimpleChange(null, component.fromAmount, true),
        });
        component.fromAmount.setValue(tokenAmount);

        component.ngOnChanges({
          fromAmount: new SimpleChange(null, component.fromAmount, false),
        });
        fixture.detectChanges();
        tick(1000);

        component.selectedSlippage$.subscribe((slippage) => {
          const percentage = new BigNumber(100).div(
            new BigNumber(100).minus(slippage)
          );

          const formControlAmountSlippageAdjusted = new BigNumber(
            component.toAmount.value
          ).times(percentage);
          expect(formControlAmountSlippageAdjusted.toNumber()).toBe(
            currency.expectedTokenToXtzValues[idx]
          );
        });
      });
    });
  }));

  it('should only give an error if the amount has more than the allowed digits', () => {
    const validAmounts = [19, 108, 4.3452, 0.000001, 0.00001];
    validAmounts.forEach((validAmount) => {
      component.fromAmount.setValue(validAmount);
      fixture.detectChanges();

      expect(fixture.componentInstance.fromAmount.valid).toBe(true);
    });

    const invalidAmounts = [0.0000001, -0.1];
    invalidAmounts.forEach((invalidAmount) => {
      component.fromAmount.setValue(invalidAmount);
      fixture.detectChanges();
      expect(fixture.componentInstance.fromAmount.valid).toBe(false);
    });
  });
});
