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

  private calculatedBakingRewardsArray = []
  private calculatedEndorsingRewardsArray = []

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
            from(this.protocol.calculateRewards(address, cycle)).pipe(
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
        from(this.protocol.calculateRewards(bakerAddress, currentCycle - 6)).pipe(
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

  public calculateBakingRightsRewards(address: string, cycle: number): Promise<TezosRewards> {
    if (this.calculatedBakingRewardsArray.indexOf(cycle) !== -1) {
      return this.calculatedBakingRewardsArray[cycle]
    } else {
      this.calculatedBakingRewardsArray[cycle] = this.protocol.calculateRewards(address, cycle)

      return this.calculatedBakingRewardsArray[cycle]
    }
  }
  public calculateEndorsingRightsRewards(address: string, cycle: number): Promise<TezosRewards> {
    if (this.calculatedEndorsingRewardsArray.indexOf(cycle) !== -1) {
      return this.calculatedEndorsingRewardsArray[cycle]
    } else {
      this.calculatedEndorsingRewardsArray[cycle] = this.protocol.calculateRewards(address, cycle)

      return this.calculatedEndorsingRewardsArray[cycle]
    }
  }
}
