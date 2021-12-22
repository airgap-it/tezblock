import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { combineLatest, of, ReplaySubject } from 'rxjs';
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
import { map, takeUntil } from 'rxjs/operators';
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
    this.selectedSlippage$.next(this.slippages[0]);
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
          this.address = connectedWallet?.address;
          if (this.addLiquidityManually) {
            const rawValue =
              await this.toCurrency?.getExpectedMinimumReceivedToken(
                new BigNumber(lastChanged.amountInTez)
                  .shiftedBy(this.fromDecimals)
                  .integerValue()
              );

            this.minimumReceived$ = of(rawValue);
            this.loadValuesBusy$.next(false);

            const value = rawValue.gt(availableBalanceTo)
              ? 'Insufficient'
              : lastChanged.amountInTez === '' ||
                lastChanged.amountInTez === '0'
              ? 0
              : rawValue.toNumber();

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

            const percentage = new BigNumber(100).minus(slippage).div(100);
            const minimumReceived = isNaN(value.times(percentage).toNumber())
              ? undefined
              : value.times(percentage);

            this.minimumReceived$ = of(minimumReceived);
            this.loadValuesBusy$.next(false);

            this.estimatedLiquidityCreated =
              await this.toCurrency.estimateLiquidityCreated(
                new BigNumber(tezToMutez(this.xtzAmount, this.fromDecimals))
              );
          }
        }
      );
  }

  async toggleAddLiquidityManually() {
    this.addLiquidityManually = !this.addLiquidityManually;
    this.manualToggle$.next();
    this.formGroup.controls['liquidityControl'].markAsUntouched();
  }

  async addLiquidity() {
    this.busy$.next(true);
    if (this.addLiquidityManually) {
      await this.toCurrency
        .addLiquidityManually(
          tezToMutez(
            this.formGroup.controls['amountControl'].value,
            this.fromDecimals
          ),
          this.address,
          tezToMutez(
            this.formGroup.controls['liquidityControl'].value,
            this.toDecimals
          )
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
              this.estimatedLiquidityCreated.toNumber()
            )
            .then((operation) => this.beaconService.operationRequest(operation))
            .catch(() => this.busy$.next(false));
        }
      }
      this.busy$.next(false);
    }
  }

  toggleManualMode() {
    this.addLiquidityManually = !this.addLiquidityManually;
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
