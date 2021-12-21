import { Component, OnChanges, SimpleChanges } from '@angular/core';
import * as fromRoot from '@tezblock/reducers';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BeaconService } from '@tezblock/services/beacon/beacon.service';
import BigNumber from 'bignumber.js';
import { from, Observable } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { formControlOptions } from '../swap/swap-utils';
import { LiquidityBaseComponent } from '../liquidity-base/liquidity-base.component';

@Component({
  selector: 'app-remove-liquidity',
  templateUrl: './remove-liquidity.component.html',
  styleUrls: ['./remove-liquidity.component.scss'],
})
export class RemoveLiquidityComponent
  extends LiquidityBaseComponent
  implements OnChanges
{
  public lqtBurned: number = 0;
  public xtzOut: BigNumber;
  public tokensOut: BigNumber;
  public amountControl: FormControl;
  public availableLiquidity$: Observable<BigNumber | undefined>;

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    private readonly beaconService: BeaconService
  ) {
    super(store$);
    this.amountControl = new FormControl(null, formControlOptions);
  }

  async ngOnChanges(_changes: SimpleChanges) {
    this.fromDecimals = this.fromCurrency.decimals;
    this.toDecimals = this.toCurrency.decimals;

    const lastChanged = this.amountControl.valueChanges.pipe(
      debounceTime(200),
      map((lqtBurned) => ({
        lqtBurned,
      }))
    );

    this.availableLiquidity$ = this.connectedWallet$?.pipe(
      switchMap((connectedWallet) => {
        if (connectedWallet) {
          this.address = connectedWallet.address;
          return from(
            this.fromCurrency.getAvailableLiquidityBalance(
              connectedWallet.address
            )
          );
        } else {
          return from([new BigNumber(0)]);
        }
      })
    );

    lastChanged
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(async (lastChanged): Promise<void> => {
        this.loadValuesBusy$.next(true);
        this.lqtBurned = lastChanged.lqtBurned;
        this.xtzOut = new BigNumber(
          await this.fromCurrency?.getLiquidityBurnXtzOut(lastChanged.lqtBurned)
        ).shiftedBy(-1 * this.toDecimals);

        this.tokensOut = new BigNumber(
          await this.fromCurrency?.getLiquidityBurnTokensOut(
            lastChanged.lqtBurned
          )
        ).shiftedBy(-1 * this.fromDecimals);
        this.loadValuesBusy$.next(false);
      });
  }

  async removeLiquidity() {
    this.busy$.next(true);
    if (this.xtzOut && this.tokensOut && this.address) {
      if (this.toCurrency) {
        await this.fromCurrency
          .removeLiquidity(this.lqtBurned, this.address)
          .then((operation) => this.beaconService.operationRequest(operation))
          .catch(() => this.busy$.next(false));
      }
    }
    this.busy$.next(false);
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
