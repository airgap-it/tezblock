import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { combineLatest, ReplaySubject } from 'rxjs';
import { formControlOptions, tezToMutez } from '../swap/swap-utils';
import { Store } from '@ngrx/store';
import * as fromRoot from '@tezblock/reducers';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import BigNumber from 'bignumber.js';
import { map, take, takeUntil } from 'rxjs/operators';
import { BeaconService } from '@tezblock/services/beacon/beacon.service';
import { LiquidityBaseComponent } from '../liquidity-base/liquidity-base.component';

@Component({
  selector: 'app-add-liquidity',
  templateUrl: './add-liquidity.component.html',
  styleUrls: ['./add-liquidity.component.scss'],
})
export class AddLiquidityComponent
  extends LiquidityBaseComponent
  implements OnChanges
{
  public xtzAmount: number = 0;
  public estimatedLiquidityCreated: BigNumber;
  public addLiquidityManually: boolean = false;
  public availableBalance: BigNumber;
  public amountControl: FormControl;
  public liquidityAmountControl: FormControl;
  public formGroup: FormGroup;
  public manualToggle$: ReplaySubject<void> = new ReplaySubject();

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    public formBuilder: FormBuilder,
    private readonly beaconService: BeaconService
  ) {
    super(store$);
    this.manualToggle$.next();
    this.formGroup = this.formBuilder.group({
      amountControl: [null, formControlOptions],
      liquidityControl: [
        null,
        Validators.compose([
          Validators.min(0),
          Validators.required,
          Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
        ]),
      ],
    });
  }

  async ngOnChanges(_changes: SimpleChanges) {
    this.fromDecimals = this.fromCurrency.decimals;
    this.toDecimals = this.toCurrency.decimals;

    const lastChanged = this.formGroup.controls[
      'amountControl'
    ].valueChanges.pipe(
      map((amountInTez) => ({
        addLiquidityManually: false,
        amountInTez,
      }))
    );

    combineLatest([
      lastChanged,
      this.selectedSlippage$,
      this.connectedWallet$,
      this.availableBalanceTo$,
      this.manualToggle$,
    ])
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(
        async ([
          lastChanged,
          slippage,
          connectedWallet,
          availableBalanceTo,
          _manualToggle,
        ]): Promise<void> => {
          this.loadValuesBusy$.next(true);
          const percentage = this.addLiquidityManually
            ? new BigNumber(1)
            : new BigNumber(100).minus(slippage).div(100);

          this.address = connectedWallet?.address;
          if (this.addLiquidityManually) {
            this.xtzAmount = new BigNumber(lastChanged.amountInTez).toNumber();

            const rawValue =
              await this.toCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(lastChanged.amountInTez)
                  .shiftedBy(this.fromDecimals)
                  .integerValue()
              );

            this.minimumReceived$.next(rawValue);
            this.loadValuesBusy$.next(false);

            const value = rawValue.gt(availableBalanceTo)
              ? 'Insufficient'
              : lastChanged.amountInTez === '' ||
                lastChanged.amountInTez === '0'
              ? 0
              : new BigNumber(
                  rawValue.times(percentage).toFixed(this.toCurrency?.decimals)
                ).toNumber();
            this.formGroup.controls['liquidityControl'].setValue(value, {
              emitEvent: false,
            });
            this.formGroup.controls['liquidityControl'].markAsTouched();
          } else {
            this.xtzAmount = new BigNumber(lastChanged.amountInTez)
              .div(2)
              .toNumber();

            const value =
              await this.toCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(this.xtzAmount)
                  .shiftedBy(this.fromDecimals)
                  .integerValue()
              );

            const minimumReceived = isNaN(value.times(percentage).toNumber())
              ? undefined
              : new BigNumber(
                  value.times(percentage).toFixed(this.toCurrency?.decimals)
                );

            this.minimumReceived$.next(minimumReceived);
            this.loadValuesBusy$.next(false);
          }

          this.estimatedLiquidityCreated =
            await this.toCurrency.estimateLiquidityCreated(
              new BigNumber(
                tezToMutez(
                  new BigNumber(this.xtzAmount).times(percentage), // TODO JGD set to 0.995?
                  this.fromDecimals
                )
              )
            );
        }
      );
  }

  async addLiquidity() {
    this.busy$.next(true);
    this.minimumReceived$.pipe(take(1)).subscribe(async (minimumReceived) => {
      const minReceived = Math.floor(
        minimumReceived.shiftedBy(this.toCurrency.decimals).toNumber()
      );
      if (this.addLiquidityManually) {
        await this.toCurrency
          .addLiquidityManually(
            this.address,
            this.estimatedLiquidityCreated.toNumber(),
            minReceived
          )
          .then((operation) => this.beaconService.operationRequest(operation))
          .catch(() => this.busy$.next(false));
      } else {
        if (this.xtzAmount && this.estimatedLiquidityCreated) {
          if (this.toCurrency) {
            await this.toCurrency
              .addLiquidity(
                tezToMutez(this.xtzAmount, this.fromDecimals),
                this.address,
                this.estimatedLiquidityCreated.toNumber(),
                minReceived
              )
              .then((operation) =>
                this.beaconService.operationRequest(operation)
              )
              .catch(() => this.busy$.next(false));
          }
        }
      }
    });
  }

  toggleManualMode() {
    this.addLiquidityManually = !this.addLiquidityManually;
    this.manualToggle$.next();
    this.formGroup.controls['liquidityControl'].markAsUntouched();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
