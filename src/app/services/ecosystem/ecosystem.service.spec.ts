import { TestBed } from '@angular/core/testing';

import { EcosystemService } from './ecosystem';

xdescribe('WalletService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EcosystemService = TestBed.inject(EcosystemService);
    expect(service).toBeTruthy();
  });
});
