import { TestBed } from '@angular/core/testing';

import { UnitHelper } from 'test-config/unit-test-helper';
import { RewardService } from './reward.service';
import { ChainNetworkService } from '../chain-network/chain-network.service';

xdescribe('RewardService', () => {
  let unitHelper: UnitHelper;

  beforeEach(() => {
    unitHelper = new UnitHelper();

    TestBed.configureTestingModule(
      unitHelper.testBed({ providers: [ChainNetworkService] })
    )
      .compileComponents()
      .catch(console.error);
  });

  it('should be created', () => {
    const service: RewardService = TestBed.inject(RewardService);
    expect(service).toBeTruthy();
  });
});
