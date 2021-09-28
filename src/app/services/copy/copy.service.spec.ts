import { TestBed } from '@angular/core/testing';
import { UnitHelper } from '../../../../test-config/unit-test-helper';

import { CopyService } from './copy.service';

xdescribe('CopyService', () => {
  let unitHelper: UnitHelper;
  beforeEach(() => {
    unitHelper = new UnitHelper();

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [] }))
      .compileComponents()
      .catch(console.error);
  });
  it('should be created', () => {
    const service: CopyService = TestBed.inject(CopyService);
    expect(service).toBeTruthy();
  });
});
