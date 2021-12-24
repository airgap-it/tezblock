import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { formControlOptions } from './swap-utils';
import * as fromRoot from '@tezblock/reducers';
import { FormControl } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { BeaconService } from '@tezblock/services/beacon/beacon.service';
import { LiquidityBaseComponent } from '../liquidity-base/liquidity-base.component';

enum SwapDirection {
  FROM = 'FROM',
  TO = 'TO',
}

interface LastChanged {
  direction: SwapDirection;
  amount: number;
}
@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
})
export class SwapComponent extends LiquidityBaseComponent implements OnChanges {
  @Output()
  onSwapDirection: EventEmitter<void> = new EventEmitter();

  @Output()
  onMinimumReceived: EventEmitter<BigNumber | undefined> = new EventEmitter();

  @Input()
  set slippage(value: number) {
    this.selectedSlippage$.next(value);
  }

  public fromTez: boolean = true;
  public fromAmount: FormControl;
  public toAmount: FormControl;

  lastChanged: BehaviorSubject<LastChanged> = new BehaviorSubject<LastChanged>({
    direction: SwapDirection.FROM,
    amount: 0,
  });

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    private readonly beaconService: BeaconService
  ) {
    super(store$);
    this.fromAmount = new FormControl(null, formControlOptions);
    this.toAmount = new FormControl(null, formControlOptions);
    this.toAmount.valueChanges
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((amount) => {
        this.lastChanged.next({
          direction: SwapDirection.TO,
          amount,
        });
      });

    this.fromAmount.valueChanges
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((amount) => {
        this.lastChanged.next({
          direction: SwapDirection.FROM,
          amount,
        });
      });
  }

  async ngOnChanges(_changes: SimpleChanges) {
    this.fromDecimals = this.fromCurrency.decimals;
    this.toDecimals = this.toCurrency.decimals;

    combineLatest([
      this.lastChanged,
      this.selectedSlippage$,
      this.connectedWallet$,
    ])
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(
        async ([lastChanged, slippage, connectedWallet]): Promise<void> => {
          this.loadValuesBusy$.next(true);

          this.address = connectedWallet?.address;
          if (!lastChanged.amount || !slippage) {
            this.updateMinimumReceived(undefined);

            this.loadValuesBusy$.next(false);
            if (lastChanged.direction === SwapDirection.FROM) {
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

          if (lastChanged.direction === SwapDirection.FROM) {
            if (this.fromTez) {
              value = await this.toCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(lastChanged.amount)
                  .shiftedBy(this.fromDecimals)
                  .integerValue()
              );
            } else {
              value = (
                await this.toCurrency?.getExpectedMinimumReceivedTez(
                  new BigNumber(lastChanged.amount)
                    .shiftedBy(this.fromDecimals)
                    .integerValue()
                    .toNumber(),
                  this.fromCurrency
                )
              ).shiftedBy(-1 * this.toDecimals);
            }

            if (!value) {
              this.updateMinimumReceived(undefined);

              this.toAmount.setValue(0, {
                emitEvent: false,
              });
              return;
            }

            const percentage = new BigNumber(100).minus(slippage).div(100);

            const result = new BigNumber(
              value.times(percentage).toFixed(this.toCurrency?.decimals)
            );

            this.updateMinimumReceived(result);
            this.loadValuesBusy$.next(false);

            this.toAmount.setValue(result.toNumber(), {
              emitEvent: false,
            });
          } else {
            if (this.fromTez) {
              value = (
                await this.toCurrency?.getExpectedMinimumReceivedTez(
                  new BigNumber(lastChanged.amount)
                    .shiftedBy(this.toDecimals)
                    .toNumber(),
                  this.fromCurrency
                )
              ).shiftedBy(-1 * this.fromDecimals);
            } else {
              value = await this.fromCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(lastChanged.amount).shiftedBy(this.toDecimals)
              );
            }

            if (!value) {
              this.updateMinimumReceived(undefined);
              this.loadValuesBusy$.next(false);
              this.fromAmount.setValue(0, {
                emitEvent: false,
              });
              return;
            }

            this.updateMinimumReceived(new BigNumber(lastChanged.amount));
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
    this.minimumReceived$.pipe(take(1)).subscribe(async (minimumReceived) => {
      if (fromAmount && minimumReceived) {
        const currency = this.fromTez ? this.toCurrency : this.fromCurrency;
        const minReceived = Math.floor(
          minimumReceived.shiftedBy(this.toCurrency.decimals).toNumber()
        );
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
    const amount = this.toAmount.value;

    const fromCurrency = this.fromCurrency;
    const toCurrency = this.toCurrency;
    this.toCurrency = fromCurrency;
    this.fromCurrency = toCurrency;

    this.fromAmount.setValue(amount, {
      emitEvent: true,
    });
    this.lastChanged.next({
      direction: SwapDirection.FROM,
      amount,
    });
  }

  updateMinimumReceived(value: BigNumber | undefined) {
    this.minimumReceived$.next(value);
    this.onMinimumReceived.next(value);
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
