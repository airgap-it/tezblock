import { AccountInfo } from '@airgap/beacon-sdk';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import { MockTokenizedBitcoinCurrency } from '../swap/MockTokenizedBitcoinCurrency';
import { TezosCurrency } from '../swap/TezosCurrency';
import { AddLiquidityComponent } from './add-liquidity.component';
import { LiquidityInputComponent } from '../liquidity-input/liquidity-input.component';
import { IdenticonComponent } from '../identicon/identicon';
import { SimpleChange } from '@angular/core';
import BigNumber from 'bignumber.js';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { getPipeMock } from 'test-config/mocks/pipe.mock';

describe('AddLiquidityComponent', () => {
  let component: AddLiquidityComponent;
  let fixture: ComponentFixture<AddLiquidityComponent>;
  const initialState = { app: appInitialState };
  let storeMock: MockStore<any>;
  const iconPipeMock = getPipeMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: IconPipe, useValue: iconPipeMock },
      ],
      declarations: [
        AddLiquidityComponent,
        LiquidityInputComponent,
        IdenticonComponent,
        IconPipe,
      ],
    }).compileComponents();

    storeMock = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLiquidityComponent);
    component = fixture.componentInstance;
    initComponent();

    storeMock = TestBed.inject(MockStore);
  });

  function initComponent() {
    component.connectedWallet$ = of({
      address: 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT',
    } as AccountInfo);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ADD LIQUIDITY BY FIRST SWAPPING TO TOKEN', function () {
    it('should properly calculate minimum received token amount and estimated liquidity created', fakeAsync(async () => {
      component.fromCurrency = new TezosCurrency(storeMock);

      const toCurrencies = [new MockTokenizedBitcoinCurrency()];

      toCurrencies.forEach((currency) => {
        component.toCurrency = currency;
        currency.tezAmounts.forEach((tezAmount, idx) => {
          component.ngOnChanges({
            addLiquidityManually: new SimpleChange(
              null,
              component.addLiquidityManually,
              true
            ),
          });

          component.ngOnChanges({
            addLiquidityManually: new SimpleChange(
              null,
              component.addLiquidityManually,
              false
            ),
          });

          component.formGroup.controls.amountControl.setValue(tezAmount);

          fixture.detectChanges();
          tick(1000);

          expect(component.estimatedLiquidityCreated.toNumber()).toBe(
            currency.expectedLiquidityCreatedValues[idx]
          );
          component.minimumReceived$.subscribe((minimumReceived) => {
            expect(minimumReceived.toNumber()).toBe(
              currency.expectedMinimumReceivedValues[idx]
            );
          });
        });
      });
    }));
  });

  describe('ADD LIQUIDITY MANUALLY', function () {
    it('should set the correct token form values in the UI when entering a tez amount', fakeAsync(async () => {
      component.addLiquidityManually = true;
      component.availableBalanceTo$ = of(new BigNumber(10000000));
      component.fromCurrency = new TezosCurrency(storeMock);
      const toCurrencies = [new MockTokenizedBitcoinCurrency()];
      toCurrencies.forEach((currency) => {
        testManualLiquidityProvision(
          currency.expectedXtzToTokenValues,
          currency
        );
      });
    }));

    it('should set the token form value as NaN in case of insufficient balance', fakeAsync(async () => {
      component.addLiquidityManually = true;
      component.availableBalanceTo$ = of(new BigNumber(0.00000001));
      component.fromCurrency = new TezosCurrency(storeMock);
      fixture.detectChanges();
      const toCurrencies = [new MockTokenizedBitcoinCurrency()];
      toCurrencies.forEach((currency) => {
        testManualLiquidityProvision([NaN, NaN, NaN, NaN, NaN], currency);
      });
    }));

    function testManualLiquidityProvision(
      expectedValues: number[],
      currency: any
    ) {
      currency.tezAmounts.forEach((tezAmount, idx) => {
        component.toCurrency = currency;

        component.ngOnChanges({
          addLiquidityManually: new SimpleChange(
            null,
            component.addLiquidityManually,
            true
          ),
        });
        component.formGroup.controls.amountControl.setValue(tezAmount);

        component.ngOnChanges({
          addLiquidityManually: new SimpleChange(
            null,
            component.addLiquidityManually,
            false
          ),
        });
        tick(1000);
        expect(component.formGroup.controls.liquidityControl.value).toEqual(
          expectedValues[idx]
        );
      });
    }
  });
});
