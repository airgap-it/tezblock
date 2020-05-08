import { Injectable } from '@angular/core'
import { TezosProtocol, TezosRewards, TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { forkJoin, from, Observable, throwError } from 'rxjs'
import { map, switchMap, catchError, take, filter } from 'rxjs/operators'
import { isNil, negate, range } from 'lodash'
import { Store } from '@ngrx/store'
import { Pageable } from '@tezblock/domain/table'

import { ChainNetworkService } from '../chain-network/chain-network.service'
import { HttpClient } from '@angular/common/http'
import { Pagination } from '@tezblock/domain/table'
import * as fromRoot from '@tezblock/reducers'
import BigNumber from 'bignumber.js'

export interface DoubleEvidence {
  lostAmount: string
  denouncedBlockLevel: number
  offender: string
  baker: string
  bakerReward: string
}

interface BalanceUpdate {
  kind: string
  category: string 
  delegate: string
  cycle: number
  change: string
}

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  protocol: TezosProtocol

  private calculatedRewardsMap = new Map<String, TezosRewards>()
  private pendingPromises = new Map<String, Promise<TezosRewards>>()

  constructor(
    private readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>,
    private readonly http: HttpClient
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
  environmentUrls = this.chainNetworkService.getEnvironment()

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

  getRewardAmount(accountAddress: string, bakerAddress: string): Observable<string> {
    return this.getCurrentCycle().pipe(
      switchMap(currentCycle =>
        from(this.calculateRewards(bakerAddress, currentCycle - 6)).pipe(
          switchMap(tezosRewards =>
            from(this.protocol.calculatePayouts(tezosRewards, 0, tezosRewards.delegatedContracts.length)).pipe(
              map(payouts => {
                const match = payouts.find(payout => payout.delegator === accountAddress)

                return match ? match.payout : null
              }),
              // when passing error in throwError then error is not catched later .. ?
              catchError(error => throwError(`getRewardAmount(${accountAddress}, ${bakerAddress})`))
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

  private getCurrentCycle(): Observable<number> {
    return this.store$.select(fromRoot.app.currentCycle).pipe(filter(negate(isNil)), take(1))
  }

  getDoubleBakingEvidenceData(blockLevel: number, operationGroupHash: string): Observable<DoubleEvidence> {
    return this.http.get(`${this.environmentUrls.rpcUrl}/chains/main/blocks/${blockLevel}`).pipe(
      map((response: any) => {
        const operation = this.findEvidenceOperationInBlock(response, operationGroupHash, 'double_baking_evidence')
        const evidence = this.getDoubleEvidenceInfo(operation.metadata.balance_updates)
        const denouncedBlockLevel = operation.bh1.level
        return {
          lostAmount: evidence.lostAmount,
          denouncedBlockLevel: denouncedBlockLevel,
          offender: evidence.offender,
          bakerReward: evidence.bakerReward,
          baker: evidence.baker
        }
      })
    )
  }

  getDoubleEndorsingEvidenceData(blockLevel: number, operationGroupHash: string): Observable<DoubleEvidence> {
    return this.http.get(`${this.environmentUrls.rpcUrl}/chains/main/blocks/${blockLevel}`).pipe(
      map((response: any) => {
        const operation = this.findEvidenceOperationInBlock(response, operationGroupHash, 'double_endorsement_evidence')
        const evidence = this.getDoubleEvidenceInfo(operation.metadata.balance_updates)
        const denouncedBlockLevel = operation.op2.operations.level
        return {
          lostAmount: evidence.lostAmount,
          denouncedBlockLevel: denouncedBlockLevel,
          offender: evidence.offender,
          bakerReward: evidence.bakerReward,
          baker: evidence.baker
        }
      })
    )
  }

  private findEvidenceOperationInBlock(block: any, operationGroupHash: string, kind: 'double_baking_evidence'|'double_endorsement_evidence'): any {
    const indexForEvidenceOperations = 2
    const operationGroups: any[] = block.operations[indexForEvidenceOperations]
    const operationGroup = operationGroups.find((operationGroup) => operationGroup.hash === operationGroupHash)
    return operationGroup.contents.find((operation: { kind: string }) => operation.kind === kind)
  }

  private getDoubleEvidenceInfo(balanceUpdates: BalanceUpdate[]): Omit<DoubleEvidence, 'denouncedBlockLevel'> {
    const deposits = balanceUpdates.find((update) => update.category === 'deposits')
    const lostAmount = balanceUpdates.filter((update) => update.delegate === deposits.delegate).reduce((current, next) => {
      return current.plus(new BigNumber(next.change))
    }, new BigNumber(0))
    const bakerRewards = balanceUpdates.filter((update) => update.delegate !== deposits.delegate)
    const baker = bakerRewards.pop().delegate
    const rewardsAmount = bakerRewards.reduce((current, next) => {
      return current.plus(new BigNumber(next.change))
    }, new BigNumber(0))
    return {
      lostAmount: lostAmount.toFixed(),
      offender: deposits.delegate,
      bakerReward: rewardsAmount.toFixed(),
      baker: baker
    }
  }
}
