import { Injectable } from '@angular/core'
import { StorageMap } from '@ngx-pwa/local-storage'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { BakerTableRatings } from '@tezblock/pages/account-detail/reducer'
import { TezosBakerResponse } from '@tezblock/interfaces/TezosBakerResponse'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

export enum CacheKeys {
  fromCurrentCycle = 'fromCurrentCycle',
  exchangeRates = 'exchangeRates'
}

export interface BakerData extends BakerTableRatings {
  efficiencyLast10Cycles?: number
}

export interface ByCycleState {
  cycleNumber: number
  myTezosBaker?: TezosBakerResponse
  fromAddress?: {
    [address: string]: {
      bakerData: BakerData
      tezosBakerFee: number
    }
  }
}

export interface ExchangeRates {
  [currencyName: string]: {
    [currencyName: string]: number
  }
}

export interface Cache {
  [CacheKeys.fromCurrentCycle]: ByCycleState
  [CacheKeys.exchangeRates]: ExchangeRates
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private updateQueue: { [key: string]: ((value: any) => any)[] } = {}
  private isBusy: { [key: string]: boolean } = {}
  private get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  delete(key: CacheKeys): Observable<undefined> {
    return this.storage.delete(key)
  }

  set<T>(key: CacheKeys, value: T): Observable<undefined> {
    if (!this.isMainnet) {
      return of()
    }

    return this.storage.set(key, value)
  }

  get<T>(key: CacheKeys): Observable<T> {
    if (!this.isMainnet) {
      return of()
    }

    return <Observable<T>>this.storage.get(key)
  }

  update<T>(key: CacheKeys, change: (value: T) => T) {
    if (!this.isMainnet) {
      return
    }

    if (!this.isBusy[key]) {
      this.executeUpdate(key, change).subscribe(() => {
        this.isBusy[key] = false

        if (this.updateQueue[key] && this.updateQueue[key].length > 0) {
          this.update(key, this.updateQueue[key].shift())
        }
      })

      return
    }

    this.updateQueue[key] = this.updateQueue[key] ? this.updateQueue[key].concat(change) : [change]
  }

  executeUpdate<T>(key: CacheKeys, change: (value: T) => T): Observable<undefined> {
    if (!this.isMainnet) {
      return of()
    }

    this.isBusy[key] = true

    return this.get<T>(key).pipe(switchMap(cacheSlice => this.set(key, change(cacheSlice))))
  }

  constructor(private readonly chainNetworkService: ChainNetworkService, private readonly storage: StorageMap) {
    // from(navigator.storage.estimate()).subscribe(x => console.log(`>>>> IndexedDB storage: ${JSON.stringify(x)}`))
  }
}
