import { TestBed } from '@angular/core/testing';

import { TransactionService } from './transaction.service';
import { UnitHelper } from 'test-config/unit-test-helper';

xdescribe('TransactionService', () => {
  let unitHelper: UnitHelper;
  beforeEach(() => {
    unitHelper = new UnitHelper();

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }));
  });

  it('should be created', () => {
    const service: TransactionService = TestBed.inject(TransactionService);
    expect(service).toBeTruthy();
  });
});
