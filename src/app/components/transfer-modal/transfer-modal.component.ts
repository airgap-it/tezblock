import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as fromRoot from '../../reducers/index';
import { Store } from '@ngrx/store';
import * as actions from '../../app.actions';
import BigNumber from 'bignumber.js';
import { combineLatest, Observable } from 'rxjs';
import { take, filter, map } from 'rxjs/operators';
import { BeaconEnabledComponent } from '../beacon-enabled-component';

export const amountValidatorOrOpts = [
  Validators.min(0),
  Validators.required,
  Validators.pattern('^[+-]?(\\d*\\.)?\\d+$'),
];
export const addressValidatorOrOpts = [
  Validators.required,
  Validators.minLength(36),
  Validators.maxLength(36),
  Validators.pattern('^(tz(1|2|3)|KT1)[\\d|a-zA-Z]{33}'),
];
@Component({
  selector: 'transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss'],
})
export class TransferModalComponent
  extends BeaconEnabledComponent
  implements OnInit
{
  decimals: number | undefined;
  symbol: string | undefined;
  thumbnailUri: string | undefined;
  contractAddress: string | undefined;
  tokenId: string | undefined;
  contractType: 'fa2' | 'fa1.2' | undefined;
  public amountControl: FormControl;
  public addressControl: FormControl;

  public balance$: Observable<BigNumber | undefined> | undefined;

  constructor(
    public bsModalRef: BsModalRef,
    protected store$: Store<fromRoot.State>
  ) {
    super(store$);
    this.amountControl = new FormControl(null, amountValidatorOrOpts);
    this.addressControl = new FormControl('', addressValidatorOrOpts);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  setMaxValue(hasFee: boolean = false): void {
    if (this.balance$) {
      combineLatest([this.balance$])
        .pipe(
          take(1),
          filter(([balance]) => balance !== undefined),
          map(([balance]) => {
            return {
              balance: balance!,
            };
          })
        )
        .subscribe(({ balance }) => {
          const result = hasFee
            ? balance.shiftedBy(-1 * this.decimals!).minus(0.5)
            : balance.shiftedBy(-1 * this.decimals!);

          this.amountControl.setValue(result.gte(0) ? result.toString() : 0);
        });
    }
  }

  async transfer() {
    const rawAmount = new BigNumber(this.amountControl.value);
    const amount = rawAmount.shiftedBy(this.decimals).toString();
    this.store$.dispatch(
      actions.transferOperation({
        destination: this.addressControl.value,
        contractAddress: this.contractAddress,
        tokenId: this.tokenId,
        amount,
        contractType: this.contractType,
      })
    );
  }
}
