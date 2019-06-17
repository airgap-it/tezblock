import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { Transaction } from './../../interfaces/Transaction'
import { IconService, IconRef } from 'src/app/services/icon/icon.service'

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
  constructor(private readonly router: Router, private readonly iconService: IconService) {}

  public inspectDetail(operationGroupHash: string) {
    this.router.navigate([`/transaction/${operationGroupHash}`])
  }

  public icon(name: IconRef): string[] {
    return this.iconService.iconProperties(name)
  }
}
