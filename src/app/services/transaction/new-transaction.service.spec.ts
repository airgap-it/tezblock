import { TestBed } from '@angular/core/testing';

import { NewTransactionService } from './new-transaction.service';
import { UnitHelper } from 'test-config/unit-test-helper'

describe('NewTransactionService', () => {
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
  });

  it('should be created', () => {
    const service: NewTransactionService = TestBed.inject(NewTransactionService);
    expect(service).toBeTruthy();
  });
});
