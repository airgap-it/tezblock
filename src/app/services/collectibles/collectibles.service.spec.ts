import { TestBed } from '@angular/core/testing';

import { CollectiblesService } from './collectibles.service';
import { UnitHelper } from '../../../../test-config/unit-test-helper';

xdescribe('CollectiblesService', () => {
  beforeEach(() => {
    const unitHelper = new UnitHelper();

    TestBed.configureTestingModule(unitHelper.testBed({}));
  });

  it('should be created', () => {
    const service: CollectiblesService = TestBed.inject(CollectiblesService);
    expect(service).toBeTruthy();
  });
});
