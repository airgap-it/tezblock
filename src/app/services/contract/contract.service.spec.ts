import { TestBed } from '@angular/core/testing';

import { ContractService } from './contract.service';
import { UnitHelper } from '../../../../test-config/unit-test-helper';

xdescribe('ContractService', () => {
  beforeEach(() => {
    const unitHelper = new UnitHelper();

    TestBed.configureTestingModule(unitHelper.testBed({}));
  });

  it('should be created', () => {
    const service: ContractService = TestBed.inject(ContractService);
    expect(service).toBeTruthy();
  });
});
