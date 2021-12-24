import { Component } from '@angular/core';
import { LiquidityBaseComponent } from '../liquidity-base/liquidity-base.component';
import * as fromRoot from '@tezblock/reducers';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-slippage',
  templateUrl: './slippage.component.html',
  styleUrls: ['./slippage.component.scss'],
})
export class SlippageComponent extends LiquidityBaseComponent {
  constructor(protected readonly store$: Store<fromRoot.State>) {
    super(store$);
  }
}
