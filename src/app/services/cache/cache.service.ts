import { Injectable } from '@angular/core'
import { StorageMap } from '@ngx-pwa/local-storage'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { BakerTableRatings } from '@tezblock/pages/account-detail/reducer'
import { TezosBakerResponse } from '@tezblock/interfaces/TezosBakerResponse'

export enum CacheKeys {
  fromCurrentCycle = 'fromCurrentCycle',
  exchangeRates = 'exchangeRates',
  byAddress = 'byAddress'
}

export interface BakerData extends BakerTableRatings {
  efficiencyLast10Cycles?: number
}

export interface CurrentCycleState {
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

export interface ByAddressState {
  [address: string]: {
    [cycle: string]: {
      rewards: TezosRewards
    }
  }
}

export interface Cache {
  [CacheKeys.fromCurrentCycle]: CurrentCycleState
  [CacheKeys.exchangeRates]: ExchangeRates
  [CacheKeys.byAddress]: ByAddressState
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private updateQueue: { [key: string]: ((value: any) => any)[] } = {}
  private isBusy: { [key: string]: boolean } = {}

  delete(key: CacheKeys): Observable<undefined> {
    return this.storage.delete(key)
  }

  set<T>(key: CacheKeys, value: T): Observable<undefined> {
    return this.storage.set(key, value)
  }

  get<T>(key: CacheKeys): Observable<T> {
    return <Observable<T>>this.storage.get(key)
  }

  update<T>(key: CacheKeys, change: (value: T) => T) {
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
    this.isBusy[key] = true

    return this.get<T>(key).pipe(switchMap(cacheSlice => this.set(key, change(cacheSlice))))
  }

  constructor(private readonly storage: StorageMap) {
    // from(navigator.storage.estimate()).subscribe(x => console.log(`>>>> IndexedDB storage: ${JSON.stringify(x)}`))
  }
}
