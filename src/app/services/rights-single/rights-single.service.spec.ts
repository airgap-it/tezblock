import { TestBed } from '@angular/core/testing';

import { RightsSingleService } from './rights-single.service';

describe('RightsSingleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RightsSingleService = TestBed.get(RightsSingleService);
    expect(service).toBeTruthy();
  });
});
