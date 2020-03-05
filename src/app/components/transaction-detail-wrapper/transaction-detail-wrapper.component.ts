import { Component, Input, OnInit } from '@angular/core'
import { animate, state, style, transition, trigger } from '@angular/animations'
import BigNumber from 'bignumber.js'
import { ToastrService } from 'ngx-toastr'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { CopyService } from 'src/app/services/copy/copy.service'
import { Transaction } from 'src/app/interfaces/Transaction'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'
import { AmountData } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'

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
          backgroundImage: ''
        })
      ),
      transition('copyGrey =>copyTick', [animate(250, style({ transform: 'rotateY(360deg) scale(1.3)', backgroundColor: 'lightgreen' }))])
    ])
  ]
})
export class TransactionDetailWrapperComponent implements OnInit {
  public current = 'copyGrey'

  @Input()
  public latestTransaction$: Observable<Transaction> | undefined

  @Input()
  public blockConfirmations$: Observable<number> | undefined

  @Input()
  public totalAmount: number | undefined

  // @Input()
  // public totalFee: number | undefined

  @Input()
  public loading$?: Observable<boolean>

  @Input()
  public fiatInfo$: Observable<CurrencyInfo> | undefined

  @Input()
  public isMainnet = true

  amountFromLatestTransactionFee$: Observable<AmountData>

  constructor(
    private readonly copyService: CopyService,
    private readonly toastrService: ToastrService
  ) {}

  public ngOnInit() {
    this.amountFromLatestTransactionFee$ = this.latestTransaction$.pipe(
      map(transition => ({ amount: transition.fee, timestamp: transition.timestamp }))
    )
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey'
    setTimeout(() => {
      this.current = 'copyGrey'
    }, 1500)
    this.toastrService.success('has been copied to clipboard', address)
  }
}
