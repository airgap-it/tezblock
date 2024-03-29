import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

import { CopyService } from 'src/app/services/copy/copy.service';
import { Transaction } from 'src/app/interfaces/Transaction';
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service';
import {
  OperationErrorMessage,
  operationErrorToMessage,
} from '@tezblock/domain/operations';
import { first } from '@tezblock/services/fp';
import { Asset } from '@tezblock/components/assets-value/assets-value.component';

@Component({
  selector: 'transaction-detail-wrapper',
  templateUrl: './transaction-detail-wrapper.component.html',
  styleUrls: ['./transaction-detail-wrapper.component.scss'],
  animations: [
    trigger('changeBtnColor', [
      state(
        'copyTick',
        style({
          backgroundColor: 'lightgreen',
          backgroundImage: '',
        })
      ),
      transition('copyGrey =>copyTick', [
        animate(
          250,
          style({
            transform: 'rotateY(360deg) scale(1.3)',
            backgroundColor: 'lightgreen',
          })
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailWrapperComponent implements OnInit {
  current = 'copyGrey';

  @Input()
  set latestTransaction(value: Transaction) {
    if (value !== this._latestTransaction) {
      this._latestTransaction = value;
      this.setDependings();
    }
  }

  get latestTransaction() {
    return this._latestTransaction;
  }

  private _latestTransaction: Transaction;

  @Input()
  blockConfirmations: number;

  @Input()
  totalAmount: number;

  // @Input()
  //  totalFee: number | undefined

  @Input()
  loading: boolean;

  @Input()
  fiatInfo: CurrencyInfo;

  @Input()
  isMainnet = true;

  @Input()
  assets: Asset[];

  amountFromLatestTransactionFee: { data: any; options: any };

  statusLabel: string;

  get error(): OperationErrorMessage {
    return this.latestTransaction &&
      this.latestTransaction.errors &&
      this.latestTransaction.errors.length > 0
      ? operationErrorToMessage(first(this.latestTransaction.errors))
      : null;
  }

  constructor(
    private readonly copyService: CopyService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit() {}

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val);
  }

  changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey';
    setTimeout(() => {
      this.current = 'copyGrey';
    }, 1500);
    this.toastrService.success('has been copied to clipboard', address);
  }

  private setDependings() {
    if (!this.latestTransaction) {
      return;
    }

    this.amountFromLatestTransactionFee = {
      data: this.latestTransaction.fee,
      options: {
        comparisonTimestamp: this.latestTransaction.timestamp,
        showFiatValue: true,
        maxDigits: 8,
        digitsInfo: '1.2-8',
      },
    };
    this.statusLabel =
      ['failed', 'backtracked', 'skipped'].indexOf(
        this.latestTransaction.status
      ) !== -1
        ? this.latestTransaction.status
        : null;
  }
}
