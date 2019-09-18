import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { Transaction } from './../../interfaces/Transaction'

@Component({
  selector: 'transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss']
})
export class TransactionItemComponent {
  public transaction$: Observable<Transaction> = new Observable()

  @Input()
  set data(value: Observable<Transaction>) {
    this.transaction$ = value
  }
  constructor(private readonly router: Router) {}

  public inspectDetail(operationGroupHash: string) {
    this.router.navigate([`/transaction/${operationGroupHash}`])
  }
}
