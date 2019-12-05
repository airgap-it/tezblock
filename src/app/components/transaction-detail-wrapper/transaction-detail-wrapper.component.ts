import { Component, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import BigNumber from 'bignumber.js'
import { CopyService } from 'src/app/services/copy/copy.service'

import { animate, state, style, transition, trigger } from '@angular/animations'
import { ToastrService } from 'ngx-toastr'
import { Observable } from 'rxjs'
import { Transaction } from 'src/app/interfaces/Transaction'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'

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
export class TransactionDetailWrapperComponent {
  public current: string = 'copyGrey'

  @Input()
  public latestTransaction$: Observable<Transaction> | undefined

  @Input()
  public blockConfirmations$: Observable<number> | undefined

  @Input()
  public amount$: Observable<BigNumber> | undefined

  @Input()
  public fee$: Observable<BigNumber> | undefined

  @Input()
  public loading$?: Observable<boolean>

  @Input()
  public fiatInfo$: Observable<CurrencyInfo> | undefined

  @Input()
  public isMainnet: boolean = true

  constructor(
    private readonly route: ActivatedRoute,
    private readonly copyService: CopyService,
    private readonly toastrService: ToastrService
  ) {}

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
