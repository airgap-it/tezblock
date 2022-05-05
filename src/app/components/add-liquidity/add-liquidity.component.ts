import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import { formControlOptions, tezToMutez } from '../swap/swap-utils';
import { Store } from '@ngrx/store';
import * as fromRoot from '@tezblock/reducers';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import BigNumber from 'bignumber.js';
import { take, takeUntil } from 'rxjs/operators';
import { BeaconService } from '@tezblock/services/beacon/beacon.service';
import {
  LastChanged,
  LiquidityBaseComponent,
  SwapDirection,
} from '../liquidity-base/liquidity-base.component';

@Component({
  selector: 'app-add-liquidity',
  templateUrl: './add-liquidity.component.html',
  styleUrls: ['./add-liquidity.component.scss'],
})
export class AddLiquidityComponent
  extends LiquidityBaseComponent
  implements OnChanges
{
  public xtzAmount: string = '0';
  public minLqtMinted: BigNumber;
  public maxTokenDeposited: string;
  public addLiquidityManually: boolean = false;
  public maxSlippageExceeded: boolean = false;
  public availableBalance: BigNumber;
  public amountControl: FormControl;
  public liquidityAmountControl: FormControl;
  public manualToggle$: ReplaySubject<void> = new ReplaySubject();

  public fromAmount: FormControl;
  public toAmount: FormControl;
  lastChanged: BehaviorSubject<LastChanged> = new BehaviorSubject<LastChanged>({
    direction: SwapDirection.FROM,
    amount: 0,
  });

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    public formBuilder: FormBuilder,
    private readonly beaconService: BeaconService
  ) {
    super(store$);
    this.manualToggle$.next();

    this.fromAmount = new FormControl(null, formControlOptions);
    this.toAmount = new FormControl(null, [
      Validators.min(0),
      Validators.required,
      Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
    ]);

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
      this.availableBalanceFrom$,
      this.availableBalanceTo$,
      this.manualToggle$,
    ])
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(
        async ([
          lastChanged,
          slippage,
          connectedWallet,
          availableBalanceFrom,
          availableBalanceTo,
          _manualToggle,
        ]): Promise<void> => {
          this.loadValuesBusy$.next(true);
          const percentage = new BigNumber(100).minus(slippage).div(100);

          this.address = connectedWallet?.address;

          this.maxTokenDeposited = new BigNumber(
            await this.toCurrency?.getExpectedTokenIn(
              new BigNumber(lastChanged.amount)
                .shiftedBy(this.fromDecimals)
                .integerValue()
            )
          )
            .div(percentage)
            .shiftedBy(-1 * this.toDecimals)
            .toString();

          if (this.addLiquidityManually) {
            if (lastChanged.direction === SwapDirection.FROM) {
              this.loadValuesBusy$.next(false);

              const estimatedTokenDeposit = new BigNumber(
                this.maxTokenDeposited
              ).gt(availableBalanceTo)
                ? 'Insufficient'
                : lastChanged.amount === null || lastChanged.amount === 0
                ? 0
                : new BigNumber(
                    new BigNumber(this.maxTokenDeposited).toFixed(
                      this.toCurrency?.decimals
                    )
                  ).toString();

              this.toAmount.setValue(estimatedTokenDeposit, {
                emitEvent: false,
              });
              this.toAmount.markAsTouched();
            } else {
              const expectedXtzIn = new BigNumber(
                await this.toCurrency?.getExpectedXtzIn(
                  new BigNumber(lastChanged.amount)
                    .shiftedBy(this.toDecimals)
                    .integerValue()
                )
              )
                .div(percentage)
                .shiftedBy(-1 * this.fromDecimals)
                .toString();

              const estimatedXtzDeposit = new BigNumber(expectedXtzIn).gt(
                availableBalanceFrom
              )
                ? 'Insufficient'
                : lastChanged.amount === null || lastChanged.amount === 0
                ? 0
                : new BigNumber(
                    new BigNumber(expectedXtzIn).toFixed(
                      this.fromCurrency?.decimals
                    )
                  ).toString();

              this.fromAmount.setValue(estimatedXtzDeposit, {
                emitEvent: false,
              });
            }
          } else {
            this.xtzAmount = new BigNumber(lastChanged.amount)
              .div(2)
              .toString();

            const priceImpact = await this.toCurrency?.estimatePriceImpact(
              new BigNumber(lastChanged.amount)
                .shiftedBy(this.fromDecimals)
                .div(2)
            );

            let newSlippage = this.slippages.find((slippage) =>
              priceImpact.lt(slippage)
            );
            if (newSlippage === undefined) {
              newSlippage = priceImpact
                .integerValue(BigNumber.ROUND_UP)
                .toNumber();
            }
            isNaN(newSlippage) ? null : this.setSlippage(newSlippage);

            this.maxTokenDeposited = isNaN(
              new BigNumber(this.maxTokenDeposited)
                .times(percentage)
                .div(2)
                .toNumber()
            )
              ? undefined
              : new BigNumber(
                  new BigNumber(this.maxTokenDeposited)
                    .div(2)
                    .toFixed(this.toCurrency?.decimals)
                ).toString();

            this.loadValuesBusy$.next(false);
          }

          this.minimumReceived$.next(new BigNumber(this.maxTokenDeposited));
          this.minLqtMinted = new BigNumber(
            await this.toCurrency.estimateLiquidityCreated(
              new BigNumber(
                tezToMutez(new BigNumber(this.xtzAmount), this.fromDecimals)
              )
            )
          )
            .times(percentage)
            .integerValue(BigNumber.ROUND_DOWN);
        }
      );
  }

  async addLiquidity() {
    this.busy$.next(true);
    this.minimumReceived$.pipe(take(1)).subscribe(async (minimumReceived) => {
      const maxTokenDeposited = Math.floor(
        minimumReceived.shiftedBy(this.toCurrency.decimals).toNumber()
      );
      if (this.addLiquidityManually) {
        await this.toCurrency
          .addLiquidityManually(
            this.address,
            tezToMutez(this.xtzAmount, this.fromDecimals),
            maxTokenDeposited,
            this.minLqtMinted.toNumber()
          )
          .then((operation) => {
            this.beaconService.operationRequest(operation);
            this.busy$.next(false);
          })
          .catch(() => this.busy$.next(false));
      } else {
        if (this.xtzAmount && this.minLqtMinted) {
          if (this.toCurrency) {
            await this.toCurrency
              .addLiquidity(
                this.address,
                tezToMutez(this.xtzAmount, this.fromDecimals),
                maxTokenDeposited,
                this.minLqtMinted.toNumber()
              )
              .then((operation) => {
                this.beaconService.operationRequest(operation);
                this.busy$.next(false);
              })
              .catch(() => this.busy$.next(false));
          }
        }
      }
    });
  }

  toggleManualMode() {
    this.addLiquidityManually = !this.addLiquidityManually;
    this.manualToggle$.next();
    this.toAmount.markAsUntouched();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
