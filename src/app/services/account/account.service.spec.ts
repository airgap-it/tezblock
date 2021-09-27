import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { AccountService, doesAcceptsDelegations } from './account.service';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  const chainNetworkServiceMock = getChainNetworkServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
      ],
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('doesAcceptsDelegations', () => {
    it('returns acceptsDelegations property', () => {
      expect(doesAcceptsDelegations(<any>{ acceptsDelegations: false })).toBe(
        false
      );
    });

    it('when argument does not have acceptsDelegations property then returns true', () => {
      expect(doesAcceptsDelegations(<any>{})).toBe(true);
    });
  });

  xdescribe('getDelegatedAccounts', () => {});
});
