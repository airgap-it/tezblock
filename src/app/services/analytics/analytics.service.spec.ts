import { TestBed } from '@angular/core/testing';

import { AnalyticsService } from './analytics.service';

xdescribe('AnalyticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnalyticsService = TestBed.inject(AnalyticsService);
    expect(service).toBeTruthy();
  });
});
