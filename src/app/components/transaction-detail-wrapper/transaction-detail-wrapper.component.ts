import { Component, Input } from '@angular/core'
import BigNumber from 'bignumber.js'
import { CopyService } from 'src/app/services/copy/copy.service'
import { ActivatedRoute } from '@angular/router'

import { ApiService } from 'src/app/services/api/api.service'
import { Transaction } from 'src/app/interfaces/Transaction'
import { CurrencyInfo } from 'src/app/services/crypto-prices/crypto-prices.service'
import { Observable } from 'rxjs'
import { IconService, IconRef } from 'src/app/services/icon/icon.service'

@Component({
  selector: 'transaction-detail-wrapper',
  templateUrl: './transaction-detail-wrapper.component.html',
  styleUrls: ['./transaction-detail-wrapper.component.scss']
})
export class TransactionDetailWrapperComponent {
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

  constructor(private readonly route: ActivatedRoute, private readonly copyService: CopyService, private readonly iconService: IconService) {}

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public icon(name: IconRef): string[] {
    return this.iconService.iconProperties(name)
  }
}
