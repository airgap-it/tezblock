import { Injectable } from '@angular/core'
import { TezosProtocol, TezosRewards, TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { forkJoin, from, Observable, of, throwError } from 'rxjs'
import { map, switchMap, catchError, take, filter } from 'rxjs/operators'
import { get, isNil, negate, range } from 'lodash'
import { Store } from '@ngrx/store'
import { Pageable } from '@tezblock/domain/table'

import { ChainNetworkService } from '../chain-network/chain-network.service'
import { Pagination } from '@tezblock/domain/table'
import * as fromRoot from '@tezblock/reducers'
import { ByAddressState, CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  protocol: TezosProtocol

  private calculatedRewardsMap = new Map<String, TezosRewards>()
  private pendingPromises = new Map<String, Promise<TezosRewards>>()

  constructor(
    private readonly cacheService: CacheService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>
  ) {
    const environmentUrls = this.chainNetworkService.getEnvironment()
    const network = this.chainNetworkService.getNetwork()

    this.protocol = new TezosProtocol(
      environmentUrls.rpcUrl,
      environmentUrls.conseilUrl,
      network,
      this.chainNetworkService.getEnvironmentVariable(),
      environmentUrls.conseilApiKey
    )
  }

  getLastCycles(pagination: Pagination): Observable<number[]> {
    return this.getCurrentCycle().pipe(
      map(currentCycle =>
        range(0, pagination.currentPage * pagination.selectedSize)
          .map(index => currentCycle - (index + 1))
          .filter(cycle => cycle >= 7)
      )
    )
  }

  getRewards(address: string, pagination: Pagination, filter?: string): Observable<TezosRewards[]> {
    return this.getLastCycles(pagination).pipe(switchMap(cycles => forkJoin(cycles.map(cycle => this.calculateRewards(address, cycle)))))
  }

  getRewardsPayouts(rewards: TezosRewards, pagination: Pagination, filter: string): Observable<Pageable<TezosPayoutInfo>> {
    const filterCondition = (address: string) => (filter ? address.toLowerCase().indexOf(filter.toLowerCase()) !== -1 : true)
    const offset = pagination ? (pagination.currentPage - 1) * pagination.selectedSize : 0
    const limit = pagination ? pagination.selectedSize : Number.MAX_SAFE_INTEGER
    const addresses = rewards.delegatedContracts.filter(filterCondition)

    return from(this.protocol.calculatePayouts(rewards, addresses.slice(offset, Math.min(offset + limit, addresses.length)))).pipe(
      map(data => ({
        data,
        total: addresses.length
      }))
    )
  }

  getRewardAmont(accountAddress: string, bakerAddress: string): Observable<string> {
    return this.getCurrentCycle().pipe(
      switchMap(currentCycle =>
        this.calculateRewards(bakerAddress, currentCycle - 6).pipe(
          switchMap(tezosRewards =>
            from(this.protocol.calculatePayouts(tezosRewards, 0, tezosRewards.delegatedContracts.length)).pipe(
              map(payouts => {
                const match = payouts.find(payout => payout.delegator === accountAddress)

                return match ? match.payout : null
              }),
              // when passing error in throwError then error is not catched later .. ?
              catchError(error => throwError(`getRewardAmont(${accountAddress}, ${bakerAddress})`))
            )
          )
        )
      )
    )
  }

  calculateRewards(address: string, cycle: number): Observable<TezosRewards> {
    return this.cacheService.get<ByAddressState>(CacheKeys.byAddress).pipe(
      switchMap(byAddressCache => {
        const rewards: any = get(byAddressCache, `${address}.${cycle}.rewards`)

        if (rewards) {
          return of(rewards as TezosRewards)
        }

        const key = `${address}${cycle}`
        const promise = this.pendingPromises.has(key)
          ? this.pendingPromises.get(key)
          : this.protocol.calculateRewards(address, cycle).then(result => {
              this.calculatedRewardsMap.set(key, result)
              this.pendingPromises.delete(key)

              const latestCycle = get(fromRoot.getState(this.store$).app.latestBlock, 'meta_cycle')

              if (cycle < latestCycle) {
                this.cacheService.update<ByAddressState>(CacheKeys.byAddress, byAddressCache => ({
                  ...byAddressCache,
                  [address]: {
                    ...get(byAddressCache, address),
                    [cycle]: {
                      ...get(byAddressCache, `${address}.${cycle}`),
                      rewards: result
                    }
                  }
                }))
              }

              return result
            })
        this.pendingPromises.set(key, promise)

        return from(promise)
      })
    )
  }

  getRewardsForAddressInCycle(address: string, cycle: number): Observable<TezosPayoutInfo> {
    return this.calculateRewards(address, cycle).pipe(switchMap(rewards => from(this.protocol.calculatePayout(address, rewards))))
  }

  private getCurrentCycle(): Observable<number> {
    return this.store$.select(fromRoot.app.currentCycle).pipe(filter(negate(isNil)), take(1))
  }
}
