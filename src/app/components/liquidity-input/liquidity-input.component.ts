import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Currency } from '@tezblock/domain/airgap';
import {
  MainTab,
  NestedTab,
} from '@tezblock/pages/liquidity-baking/liquidity-baking.component';
import BigNumber from 'bignumber.js';
import { Observable, Subscription } from 'rxjs';
import { AbstractCurrency } from '../swap/swap-utils';

@Component({
  selector: 'app-liquidity-input',
  templateUrl: './liquidity-input.component.html',
  styleUrls: ['./liquidity-input.component.scss'],
})
export class LiquidityInputComponent {
  @Input()
  loadValuesBusy: boolean = false;

  @Input()
  public amountControl: FormControl;

  @Input()
  public tab: MainTab | NestedTab;

  @Input()
  currency: AbstractCurrency;

  @Input()
  balance: BigNumber;

  @Input()
  public allowAmountGreaterThanBalance: boolean = false;

  @Input()
  public displayLiquidityToken: boolean = false;

  @Input()
  public toggleMaxDisabled: boolean = false;

  private readonly MAX_FEE_MUTEZ = new BigNumber(5000);

  constructor() {}

  setMaxValue(): void {
    const maxFeeValue = this.MAX_FEE_MUTEZ.shiftedBy(
      -1 * this.currency.decimals
    );

    if (this.balance.gt(maxFeeValue) || this.currency.symbol !== Currency.XTZ) {
      this.amountControl.markAsTouched();
      if (this.currency.symbol === Currency.XTZ) {
        const maxTransferableBalance = this.balance.minus(maxFeeValue);
        this.amountControl.setValue(maxTransferableBalance);
      } else {
        this.amountControl.setValue(this.balance.toNumber());
      }
    }
  }
}
