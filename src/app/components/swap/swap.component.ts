import {
  Component,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import BigNumber from 'bignumber.js';
import { combineLatest, Observable, of } from 'rxjs';
import { formControlOptions, tezToMutez } from './swap-utils';
import * as fromRoot from '@tezblock/reducers';
import { FormControl } from '@angular/forms';
import { merge } from 'lodash';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { BeaconService } from '@tezblock/services/beacon/beacon.service';
import { LiquidityBaseComponent } from '../liquidity-base/liquidity-base.component';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
})
export class SwapComponent extends LiquidityBaseComponent implements OnChanges {
  @Output()
  onSwapDirection: EventEmitter<void> = new EventEmitter();

  @Output()
  onMinimumReceived: EventEmitter<Observable<BigNumber | undefined>> =
    new EventEmitter();

  public fromTez: boolean = true;
  public fromAmount: FormControl;
  public toAmount: FormControl;

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    private readonly beaconService: BeaconService
  ) {
    super(store$);
    this.fromAmount = new FormControl(null, formControlOptions);
    this.toAmount = new FormControl(null, formControlOptions);
    this.selectedSlippage$.next(this.slippages[0]);
  }

  async ngOnChanges(_changes: SimpleChanges) {
    this.fromDecimals = this.fromCurrency.decimals;
    this.toDecimals = this.toCurrency.decimals;

    const lastChanged = merge(
      this.toAmount.valueChanges.pipe(
        debounceTime(300),
        map((amountInTez) => ({
          direction: 'to',
          amountInTez,
        }))
      ),
      this.fromAmount.valueChanges.pipe(
        debounceTime(300),
        map((amountInTez) => ({
          direction: 'from',
          amountInTez,
        }))
      )
    );

    combineLatest([lastChanged, this.selectedSlippage$, this.connectedWallet$])
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(
        async ([lastChanged, slippage, connectedWallet]): Promise<void> => {
          this.loadValuesBusy$.next(true);
          this.address = connectedWallet?.address;
          if (!lastChanged.amountInTez || !slippage) {
            this.minimumReceived$ = of(undefined);
            this.updateMinimumReceived();

            this.loadValuesBusy$.next(false);
            if (lastChanged.direction === 'from') {
              this.toAmount.setValue(0, {
                emitEvent: false,
              });
            } else {
              this.fromAmount.setValue(0, {
                emitEvent: false,
              });
            }

            return;
          }

          let value: BigNumber | undefined;

          if (lastChanged.direction === 'from') {
            if (this.fromTez) {
              value = await this.toCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(lastChanged.amountInTez)
                  .shiftedBy(this.fromDecimals)
                  .integerValue()
              );
            } else {
              value = (
                await this.toCurrency?.getExpectedMinimumReceivedTez(
                  new BigNumber(lastChanged.amountInTez)
                    .shiftedBy(this.fromDecimals)
                    .integerValue()
                    .toNumber(),
                  this.fromCurrency
                )
              ).shiftedBy(-1 * this.toDecimals);
            }

            if (!value) {
              this.minimumReceived$ = of(undefined);
              this.updateMinimumReceived();

              this.toAmount.setValue(0, {
                emitEvent: false,
              });
              return;
            }

            const percentage = new BigNumber(100).minus(slippage).div(100);

            const result = value.times(percentage);

            this.minimumReceived$ = of(result);
            this.updateMinimumReceived();

            this.loadValuesBusy$.next(false);

            this.toAmount.setValue(result.toNumber(), {
              emitEvent: false,
            });
          } else {
            if (this.fromTez) {
              value = await this.toCurrency?.getExpectedMinimumReceivedTez(
                new BigNumber(lastChanged.amountInTez)
                  .shiftedBy(this.toDecimals)
                  .toNumber(),
                this.fromCurrency
              );
            } else {
              value = await this.fromCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(lastChanged.amountInTez).shiftedBy(
                  this.toDecimals
                )
              );
            }

            if (!value) {
              this.minimumReceived$ = of(undefined);
              this.updateMinimumReceived();

              this.loadValuesBusy$.next(false);
              this.fromAmount.setValue(0, {
                emitEvent: false,
              });
              return;
            }

            this.minimumReceived$ = of(
              new BigNumber(
                tezToMutez(lastChanged.amountInTez, this.toDecimals)
              )
            );
            this.updateMinimumReceived();
            this.loadValuesBusy$.next(false);

            const percentage = new BigNumber(100).minus(slippage).div(100);

            const result = value.times(percentage);

            this.fromAmount.setValue(result.toNumber(), {
              emitEvent: false,
            });
          }
        }
      );
  }

  async swap() {
    this.busy$.next(true);
    const fromAmount = new BigNumber(this.fromAmount.value);
    this.minimumReceived$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(async (minimumReceived) => {
        if (fromAmount && minimumReceived) {
          const currency = this.fromTez ? this.toCurrency : this.fromCurrency;
          const minReceived = Math.floor(minimumReceived.toNumber());
          if (currency) {
            if (this.fromTez) {
              await currency
                .fromTez(this.address, fromAmount, minReceived)
                .then((operation) => {
                  this.beaconService.operationRequest(operation);
                })
                .catch(() => this.busy$.next(false));
            } else {
              await currency
                .toTez(this.address, fromAmount, minReceived)
                .then((operation) => {
                  this.beaconService.operationRequest(operation);
                })
                .catch(() => this.busy$.next(false));
            }
          }
        }
        this.busy$.next(false);
      });
  }

  swapDirection() {
    this.onSwapDirection.emit();
    this.fromTez = !this.fromTez;
  }

  updateMinimumReceived() {
    this.onMinimumReceived.next(this.minimumReceived$);
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
