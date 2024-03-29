import { TestBed } from '@angular/core/testing';

import { UnitHelper } from 'test-config/unit-test-helper';
import { BlockService } from './blocks.service';
import { ApiService } from '../api/api.service';
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock';

xdescribe('BlocksService', () => {
  let unitHelper: UnitHelper;
  beforeEach(() => {
    unitHelper = new UnitHelper();

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [{ provide: ApiService, useValue: getApiServiceMock() }],
      })
    )
      .compileComponents()
      .catch(console.error);
  });

  it('should be created', () => {
    const service: BlockService = TestBed.inject(BlockService);
    expect(service).toBeTruthy();
  });
});
