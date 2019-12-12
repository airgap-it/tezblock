import { TestBed } from '@angular/core/testing';

import { UnitHelper } from 'test-config/unit-test-helper'
import { RewardService } from './reward.service';
import { ChainNetworkService } from '../chain-network/chain-network.service'

describe('RewardService', () => {
  let unitHelper: UnitHelper

  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(unitHelper.testBed({ providers: [ChainNetworkService] }))
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: RewardService = TestBed.get(RewardService);
    expect(service).toBeTruthy();
  });
});
