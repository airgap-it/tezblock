import { Injectable } from '@angular/core'
import { TezosProtocol, TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { forkJoin, from, Observable, of, throwError } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { range } from 'lodash'

import { ChainNetworkService } from '../chain-network/chain-network.service'
import { Pagination } from '@tezblock/services/facade/facade'
import { Payout } from '@tezblock/interfaces/Payout'
import { addCycleFromLevel, ApiService } from '@tezblock/services/api/api.service'
import { AggregatedBakingRights, BakingRights } from '@tezblock/interfaces/BakingRights'
import { last, groupBy } from '@tezblock/services/fp'

export interface ExpTezosRewards extends TezosRewards {
  payouts: Payout[]
}

const cycleToLevel = (cycle: number): number => cycle * 4096

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  protocol: TezosProtocol

  constructor(private readonly apiService: ApiService, private readonly chainNetworkService: ChainNetworkService) {
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

  getAggregatedBakingRights(address: string, limit: number): Observable<AggregatedBakingRights[]> {
    const group = groupBy('cycle')

    return this.getLastCycles({ selectedSize: limit, currentPage: 0 }).pipe(
      switchMap(cycles => {
        const level = cycleToLevel(last(cycles)) - 1//-1 to hack operation: 'gt' into: operation: 'ge'/'gte'
        const predicates = [
          {
            field: 'level',
            operation: 'gt',
            set: [level]
          }
        ]

        return this.apiService.getBakingRights(address, null, predicates).pipe(
          map((rights: BakingRights[]) => rights.map(addCycleFromLevel)),
          map((rights: BakingRights[]) =>
            Object.entries(group(rights)).map(
              ([cycle, items]) =>
                <AggregatedBakingRights>{
                  cycle: parseInt(cycle),
                  bakingsCount: (<any[]>items).length,
                  blockRewards: undefined,
                  deposits: undefined,
                  fees: undefined,
                  items
                }
            )
          ),
          switchMap((aggregatedRights: AggregatedBakingRights[]) => {
            return forkJoin(aggregatedRights.map(aggregatedRight =>
              from(this.protocol.calculateRewards(address, aggregatedRight.cycle)).pipe(
                map(reward => {
                  return aggregatedRight
                })
              )))
          })
        )
      })
    )
  }
}
