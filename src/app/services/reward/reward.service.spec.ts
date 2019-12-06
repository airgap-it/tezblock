import { TestBed } from '@angular/core/testing';

import { RewardService } from './reward.service';

describe('RewardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RewardService = TestBed.get(RewardService);
    expect(service).toBeTruthy();
  });
});
