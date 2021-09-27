import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ChainNetworkService } from '../chain-network/chain-network.service';
import { first } from '@tezblock/services/fp';
import { map } from 'rxjs/operators';

export interface BlockStatus {
  timestamp: number;
  level: number;
}

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private environmentUrls: {
    rpcUrl: string;
    conseilUrl: string;
    conseilApiKey: string;
    targetUrl: string;
  };

  get options() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        apikey: this.environmentUrls.conseilApiKey,
      }),
    };
  }

  constructor(
    private readonly chainNetworkService: ChainNetworkService,
    private readonly httpClient: HttpClient
  ) {
    this.environmentUrls = this.chainNetworkService.getEnvironment();
  }

  loadLatestNodeBlock(): Observable<any> {
    const url = `${this.environmentUrls.rpcUrl}/chains/main/blocks/head/`;

    return this.httpClient.get<any>(url);
  }

  loadLatestConseilBlock(): Observable<BlockStatus> {
    const url = `${this.environmentUrls.conseilUrl}/v2/data/tezos/mainnet/blocks`;

    return this.httpClient
      .post<any[]>(
        url,
        {
          fields: ['timestamp', 'level'],
          orderBy: [
            {
              field: 'level',
              direction: 'desc',
            },
          ],
          limit: 1,
        },
        this.options
      )
      .pipe(map(first));
  }
}
