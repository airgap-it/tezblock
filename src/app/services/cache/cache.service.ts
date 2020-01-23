import { Injectable } from '@angular/core';

import { StorageMap } from '@ngx-pwa/local-storage'
import { Observable } from 'rxjs';

export enum CacheKeys {
  fromCurrentCycle = 'fromCurrentCycle'
}

export interface ByCycleState {
  cycleNumber: number
}

export interface Cache {
  [CacheKeys.fromCurrentCycle]: ByCycleState
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  delete(key: CacheKeys): Observable<undefined> {
    return this.storage.delete(key)
  }

  set(key: CacheKeys, value: Cache[CacheKeys]): Observable<undefined> {
    return this.storage.set(key, value)
  }

  constructor(private readonly storage: StorageMap) { }
}
