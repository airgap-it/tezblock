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

import { LiquidityInputComponent } from '../liquidity-input/liquidity-input.component';
import { IdenticonComponent } from '../identicon/identicon';
import { SimpleChange } from '@angular/core';
import { RemoveLiquidityComponent } from './remove-liquidity.component';
import { TezosCurrency } from '../swap/TezosCurrency';
import { MockTokenizedBitcoinCurrency } from '../swap/MockTokenizedBitcoinCurrency';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { getPipeMock } from 'test-config/mocks/pipe.mock';

describe('RemoveLiquidityComponent', () => {
  let component: RemoveLiquidityComponent;
  let fixture: ComponentFixture<RemoveLiquidityComponent>;
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
        RemoveLiquidityComponent,
        LiquidityInputComponent,
        IdenticonComponent,
        IconPipe,
      ],
    }).compileComponents();

    storeMock = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveLiquidityComponent);
    component = fixture.componentInstance;

    storeMock = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly calculate minimum received token amount and estimated liquidity created', fakeAsync(async () => {
    component.toCurrency = new TezosCurrency(storeMock);
    component.connectedWallet$ = of({
      address: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ',
    } as AccountInfo);

    const fromCurrencies = [new MockTokenizedBitcoinCurrency()];

    fromCurrencies.forEach((currency: any) => {
      component.fromCurrency = currency;
      currency.tezAmounts.forEach((tezAmount, idx) => {
        component.ngOnChanges({
          lqtBurned: new SimpleChange(null, component.lqtBurned, true),
        });
        component.amountControl.setValue(tezAmount);
        component.ngOnChanges({
          lqtBurned: new SimpleChange(null, component.lqtBurned, false),
        });
        fixture.detectChanges();
        tick(1000);
        expect(component.minXtzWithdrawn.toNumber()).toEqual(
          currency.expectedXtzOutValues[idx]
        );
        expect(component.minTokensWithdrawn.toNumber()).toEqual(
          currency.expectedTokensOutValues[idx]
        );
      });
    });
  }));
});
