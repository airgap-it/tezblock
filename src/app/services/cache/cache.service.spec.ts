import { TestBed } from '@angular/core/testing';

import { CacheService } from './cache.service';

xdescribe('CacheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CacheService = TestBed.inject(CacheService);
    expect(service).toBeTruthy();
  });
});
