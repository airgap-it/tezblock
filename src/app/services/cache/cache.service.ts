import { Injectable } from '@angular/core'
import { StorageMap } from '@ngx-pwa/local-storage'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { BakerTableRatings } from '@tezblock/pages/account-detail/reducer'

export enum CacheKeys {
  fromCurrentCycle = 'fromCurrentCycle'
}

export interface BakerData extends BakerTableRatings {
  efficiencyLast10Cycles?: number
}

export interface ByCycleState {
  cycleNumber: number
  fromAddress?: {
    [address: string]: {
      bakerData: BakerData
      tezosBakerFee: number
    }
  }
}

export interface Cache {
  [CacheKeys.fromCurrentCycle]: ByCycleState
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private updateQueue: { [key: string]: ((value: Cache[CacheKeys]) => Cache[CacheKeys])[] } = {}
  private isBusy: { [key: string]: boolean } = {}

  delete(key: CacheKeys): Observable<undefined> {
    return this.storage.delete(key)
  }

  set(key: CacheKeys, value: Cache[CacheKeys]): Observable<undefined> {
    return this.storage.set(key, value)
  }

  get(key: CacheKeys): Observable<Cache[CacheKeys]> {
    return <Observable<Cache[CacheKeys]>>this.storage.get(key)
  }

  update(key: CacheKeys, change: (value: Cache[CacheKeys]) => Cache[CacheKeys]) {
    if (!this.isBusy[key]) {
      this.executeUpdate(key, change).subscribe(() => {
        this.isBusy[key] = false

        if (this.updateQueue[key].length > 0) {
          this.update(key, this.updateQueue[key].shift())
        }
      })

      return
    }

    this.updateQueue[key] = this.updateQueue[key] ? this.updateQueue[key].concat(change) : [change]
  }

  executeUpdate(key: CacheKeys, change: (value: Cache[CacheKeys]) => Cache[CacheKeys]): Observable<undefined> {
    this.isBusy[key] = true

    return this.get(key).pipe(switchMap(cacheSlice => this.set(key, change(cacheSlice))))
  }

  constructor(private readonly storage: StorageMap) {}
}
