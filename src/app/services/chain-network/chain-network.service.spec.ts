import { TestBed } from '@angular/core/testing';

import { ChainNetworkService } from './chain-network.service';

xdescribe('ChainNetworkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChainNetworkService = TestBed.inject(ChainNetworkService);
    expect(service).toBeTruthy();
  });
});
