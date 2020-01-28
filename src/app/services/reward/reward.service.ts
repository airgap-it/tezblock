import { Injectable } from '@angular/core'
import { TezosProtocol, TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { forkJoin, from, Observable, of, throwError } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { range } from 'lodash'

import { ChainNetworkService } from '../chain-network/chain-network.service'
import { Pagination } from '@tezblock/services/facade/facade'
import { Payout } from '@tezblock/interfaces/Payout'

export interface ExpTezosRewards extends TezosRewards {
  payouts: Payout[]
}

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  protocol: TezosProtocol

  private calculatedRewardsMap = new Map<String, TezosRewards>()
  private pendingPromise = new Map<String, Promise<TezosRewards>>()

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
      map(currentCycle => {
        const startIndex = pagination.currentPage * pagination.selectedSize
        const endIndex = startIndex + pagination.selectedSize

        return range(startIndex, endIndex)
          .map(index => currentCycle - (index + 1))
          .filter(cycle => cycle >= 7)
      })
    )
  }

  getRewards(address: string, pagination: Pagination): Observable<ExpTezosRewards[]> {
    return this.getLastCycles(pagination).pipe(
      switchMap(cycles =>
        forkJoin(
          cycles.map(cycle =>
            from(this.calculateRewards(address, cycle)).pipe(
              switchMap(rewards =>
                from(this.protocol.calculatePayouts(rewards, 0, rewards.delegatedContracts.length)).pipe(
                  map(payouts => ({ ...rewards, payouts }))
                )
              )
            )
          )
        )
      )
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

  public async calculateRewards(address: string, cycle: number): Promise<TezosRewards> {
    const key = `${address}${cycle}`

    if (this.calculatedRewardsMap.has(key)) {
      return this.calculatedRewardsMap.get(key)
    }
    // else {
    //   if (this.pendingPromise.has(key)) {
    //     console.log('in if')
    //     const rewardsPromise: Promise<TezosRewards> = this.pendingPromise[key]
    //     const currentCycle = this.protocol.fetchCurrentCycle()

    //     await Promise.all([rewardsPromise, currentCycle]).then(values => {
    //       console.log('our values: ', values)
    //       if (cycle < values[1]) {
    //         console.log('rewards ', values[0])
    //         this.calculatedRewardsMap.set(key, values[0])
    //         return values[0]
    //       }
    //     })
    //   } else {
    //     this.pendingPromise.set(key, this.protocol.calculateRewards(address, cycle))
    //   }
    // }

    const rewards = await this.protocol.calculateRewards(address, cycle)
    const currentCycle = await this.protocol.fetchCurrentCycle()
    if (cycle < currentCycle) {
      this.calculatedRewardsMap.set(key, rewards)
    }
    return rewards
  }
}
