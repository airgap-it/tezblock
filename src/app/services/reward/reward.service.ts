import { Injectable } from '@angular/core'
import { TezosProtocol, TezosRewards, TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { forkJoin, from, Observable, throwError } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { range } from 'lodash'
import { Pageable } from '@tezblock/domain/table'

import { ChainNetworkService } from '../chain-network/chain-network.service'
import { Pagination } from '@tezblock/domain/table'

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  protocol: TezosProtocol

  private calculatedRewardsMap = new Map<String, TezosRewards>()
  private pendingPromises = new Map<String, Promise<TezosRewards>>()

  constructor(private readonly chainNetworkService: ChainNetworkService) {
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
    return from(this.protocol.fetchCurrentCycle()).pipe(
      map(currentCycle =>
        range(0, pagination.currentPage * pagination.selectedSize)
          .map(index => currentCycle - (index + 1))
          .filter(cycle => cycle >= 7)
      )
    )
  }

  getRewards(address: string, pagination: Pagination, filter?: string): Observable<TezosRewards[]> {
    return this.getLastCycles(pagination).pipe(
      switchMap(cycles => forkJoin(cycles.map(cycle => from(this.calculateRewards(address, cycle)))))
    )
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
    return from(this.protocol.fetchCurrentCycle()).pipe(
      switchMap(currentCycle =>
        from(this.calculateRewards(bakerAddress, currentCycle - 6)).pipe(
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

  async calculateRewards(address: string, cycle: number): Promise<TezosRewards> {
    const key = `${address}${cycle}`

    if (this.calculatedRewardsMap.has(key)) {
      return this.calculatedRewardsMap.get(key)
    }

    if (this.pendingPromises.has(key)) {
      return this.pendingPromises.get(key)
    }

    const promise = this.protocol.calculateRewards(address, cycle).then(result => {
      this.calculatedRewardsMap.set(key, result)
      this.pendingPromises.delete(key)
      return result
    })
    this.pendingPromises.set(key, promise)

    return promise
  }

  getRewardsForAddressInCycle(address: string, cycle: number): Observable<TezosPayoutInfo> {
    return from(this.calculateRewards(address, cycle)).pipe(switchMap(rewards => from(this.protocol.calculatePayout(address, rewards))))
  }
}
