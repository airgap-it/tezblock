import { TestBed } from '@angular/core/testing';
import { StorageMap } from '@ngx-pwa/local-storage';
import { of } from 'rxjs';

import { CacheService, CacheKeys } from './cache.service';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock';
import { getStorageMapMock } from 'test-config/mocks/storage-map.mock';
import { TezosNetwork } from '@airgap/coinlib-core';

describe('CacheService', () => {
  let service: CacheService;
  const chainNetworkServiceMock = getChainNetworkServiceMock();
  const storageMapMock = getStorageMapMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: StorageMap, useValue: storageMapMock },
      ],
    });

    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('update', () => {
    it('when network is not Mainnet then does not run executeUpdate or update updateQueue', () => {
      chainNetworkServiceMock.getNetwork.and.returnValue(
        TezosNetwork.HANGZHOUNET
      );
      spyOn(service, 'executeUpdate');

      service.update(CacheKeys.fromCurrentCycle, () => null);

      expect(service.executeUpdate).not.toHaveBeenCalled();
      expect((<any>service).updateQueue).toEqual({});
    });

    it('when operation for given key is busy then only updates updateQueue', () => {
      const change = () => {
        A: 7;
      };

      chainNetworkServiceMock.getNetwork.and.returnValue(TezosNetwork.MAINNET);
      spyOn(service, 'executeUpdate');
      (<any>service).isBusy[CacheKeys.fromCurrentCycle] = true;
      service.update(CacheKeys.fromCurrentCycle, change);

      expect(service.executeUpdate).not.toHaveBeenCalled();
      expect((<any>service).updateQueue[CacheKeys.fromCurrentCycle]).toEqual([
        change,
      ]);
    });

    it('when operation for given key is NOT busy then run executeUpdate and NOT updates updateQueue', () => {
      const change = () => {
        A: 7;
      };

      chainNetworkServiceMock.getNetwork.and.returnValue(TezosNetwork.MAINNET);
      spyOn(service, 'executeUpdate').and.callThrough();
      storageMapMock.get.and.returnValue(of('A'));
      storageMapMock.set.and.returnValue(of(undefined));

      service.update(CacheKeys.fromCurrentCycle, change);

      expect(service.executeUpdate).toHaveBeenCalledWith(
        CacheKeys.fromCurrentCycle,
        change
      );
      expect((<any>service).updateQueue).toEqual({});
    });

    it('when operation is in queue then after update calls another update with operation from queue', () => {
      const change = () => {
        A: 1;
      };
      const awaitingChange = () => {
        A: 2;
      };

      chainNetworkServiceMock.getNetwork.and.returnValue(TezosNetwork.MAINNET);
      spyOn(service, 'executeUpdate').and.callThrough();
      const updateSpy = spyOn(service, 'update').and.callThrough();
      storageMapMock.get.and.returnValue(of('X'));
      storageMapMock.set.and.returnValue(of(undefined));
      (<any>service).updateQueue[CacheKeys.fromCurrentCycle] = [awaitingChange];

      service.update(CacheKeys.fromCurrentCycle, change);

      expect(updateSpy.calls.all().length).toEqual(2);
      expect(updateSpy.calls.all()[0].args).toEqual([
        CacheKeys.fromCurrentCycle,
        change,
      ]);
      expect(updateSpy.calls.all()[1].args).toEqual([
        CacheKeys.fromCurrentCycle,
        awaitingChange,
      ]);
    });
  });
});
