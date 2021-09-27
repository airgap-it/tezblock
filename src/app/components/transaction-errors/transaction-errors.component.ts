import { Component, Input, OnInit } from '@angular/core';

import {
  OperationError,
  OperationErrorMessage,
  operationErrorToMessage,
} from '@tezblock/domain/operations';
import { first } from '@tezblock/services/fp';

@Component({
  selector: 'app-transaction-errors',
  templateUrl: './transaction-errors.component.html',
  styleUrls: ['./transaction-errors.component.scss'],
})
export class TransactionErrorsComponent implements OnInit {
  @Input() errors: OperationError[];

  // TODO: display multiple errors in tooltip ?
  get error(): OperationErrorMessage {
    return this.errors && this.errors.length > 0
      ? operationErrorToMessage(first(this.errors))
      : null;
  }

  constructor() {}

  ngOnInit() {}
}
