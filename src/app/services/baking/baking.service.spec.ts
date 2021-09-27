import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { BakingService } from './baking.service';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { CacheService } from '@tezblock/services/cache/cache.service';
import { getCacheServiceMock } from '@tezblock/services/cache/cache.service.mock';
import { Baker } from 'src/app/interfaces/TezosBakerResponse';

describe('BakingService', () => {
  let service: BakingService;
  let httpMock: HttpTestingController;
  const chainNetworkServiceMock = getChainNetworkServiceMock();
  const cacheServiceMock = getCacheServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
      ],
    });

    service = TestBed.inject(BakingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
