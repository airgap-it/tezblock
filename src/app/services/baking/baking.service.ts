import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { BakingBadResponse } from 'src/app/interfaces/BakingBadResponse';
import {
  TezosBakerResponse,
  Baker,
} from 'src/app/interfaces/TezosBakerResponse';
import { ChainNetworkService } from '../chain-network/chain-network.service';
import { first } from '@tezblock/services/fp';
import { get as _get } from 'lodash';
import {
  CacheService,
  CacheKeys,
  CurrentCycleState,
} from '@tezblock/services/cache/cache.service';
import { BaseService, Operation } from '@tezblock/services/base.service';
import { getTezosProtocol } from '@tezblock/domain/airgap';

interface TezosNodesApiResponse {
  name: string;
  address: string;
  efficiency_last10cycle: number;
  freespace: number;
  last_endoresment: string;
  last_baking: string;
  next_endoresment: string;
  next_baking: string;
}

type Moment = moment.Moment;
const hoursPerCycle = 68;

@Injectable({
  providedIn: 'root',
})
export class BakingService extends BaseService {
  private readonly bakingBadUrl = 'https://api.baking-bad.org/v2/bakers';
  private readonly tezosBakerUrl = 'https://api.mytezosbaker.com/v1/bakers/';
  private readonly efficiencyLast10CyclesUrl =
    'https://api.tezos-nodes.com/v1/baker/';
  private readonly airgapCorsProxy =
    'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=';

  constructor(
    private readonly cacheService: CacheService,
    private readonly http: HttpClient,
    readonly chainNetworkService: ChainNetworkService
  ) {
    super(chainNetworkService, http);
  }

  getBakingBadRatings(address: string): Observable<BakingBadResponse> {
    return this.http
      .get<BakingBadResponse>(`${this.bakingBadUrl}/${address}`, {
        params: { configs: 'true', insurance: 'true' },
      })
      .pipe(
        map((response) => ({
          ...response,
          status: response ? 'success' : 'error',
        }))
      );
  }

  getBakerInfos(tzAddress: string): Observable<any> {
    return this.get<any[]>(
      `{rpcUrl}/chains/main/blocks/head/context/delegates/${tzAddress}` /* delegates (previously) */,
      true
    );
  }

  getStakingCapacityFromTezosProtocol(tzAddress: string): Observable<number> {
    const network = this.chainNetworkService.getNetwork();
    const tezosProtocol = getTezosProtocol(this.environmentUrls, network);

    return from(tezosProtocol.bakerInfo(tzAddress)).pipe(
      map((response) => response.bakerCapacity.multipliedBy(0.7).toNumber())
    );
  }

  addPayoutDelayToMoment(time: Moment): Moment {
    return time.add(hoursPerCycle * 7 + 0, 'h');
  }

  getEfficiencyLast10Cycles(address: string): Observable<number> {
    return this.http
      .get<TezosNodesApiResponse>(
        `${this.airgapCorsProxy}${this.efficiencyLast10CyclesUrl}${address}`
      )
      .pipe(map((response) => response.efficiency_last10cycle));
  }
}
