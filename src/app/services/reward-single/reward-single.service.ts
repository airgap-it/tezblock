import { Injectable } from '@angular/core'
import { TezosProtocol, TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { combineLatest, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { distinctPagination, Facade, Pagination } from '../facade/facade'
import { ChainNetworkService } from '../chain-network/chain-network.service'

interface RewardSingleServiceState {
  rewards: any
  address: string | undefined
  pagination: Pagination
  loading: boolean
}

const initialState: RewardSingleServiceState = {
  rewards: [],
  address: '',
  pagination: {
    currentPage: 0,
    selectedSize: 3,
    pageSizes: [5, 10, 20, 50]
  },
  loading: true
}

@Injectable({
  providedIn: 'root'
})
export class RewardSingleService extends Facade<RewardSingleServiceState> {
  public rewards$ = this.state$.pipe(
    map(state => state.rewards),
    distinctUntilChanged()
  )
  public address$ = this.state$.pipe(
    map(state => state.address),
    distinctUntilChanged()
  )
  public pagination$ = this.state$.pipe(
    map(state => state.pagination),
    distinctUntilChanged(distinctPagination)
  )
  public loading$ = this.state$.pipe(map(state => state.loading))

  constructor(public readonly chainNetworkService: ChainNetworkService) {
    super(initialState)
    const environmentUrls = this.chainNetworkService.getEnvironment()
    const network = this.chainNetworkService.getNetwork()
    const protocol = new TezosProtocol(environmentUrls.rpcUrl, environmentUrls.conseilUrl, network, this.chainNetworkService.getEnvironmentVariable(), environmentUrls.conseilApiKey)

    this.subscription = combineLatest([this.pagination$, this.address$])
      .pipe(
        switchMap(async ([pagination, address]) => {
          const currentCycle = await protocol.fetchCurrentCycle()
          const rewardsResults: Array<Promise<TezosRewards>> = []
          const startIndex = pagination.currentPage * pagination.selectedSize
          const endIndex = startIndex + pagination.selectedSize
          for (let i = startIndex; i < endIndex; i++) {
            const cycle = currentCycle - (i + 1)
            if (cycle < 7) {
              break
            }
            rewardsResults.push(protocol.calculateRewards(address, cycle).then(async result => {
              // TODO: payouts needs to be paginated instead of retrieving them all at once
              (result as any).payouts = await protocol.calculatePayouts(result, 0, result.delegatedContracts.length)
              return result
            }))
          }
          const rewards = await Promise.all(rewardsResults)
          return [
            ...this._state.rewards,
            ...rewards
          ]
        })
      )
      .subscribe(rewards => {
        this.updateState({ ...this._state, rewards, loading: false })
      })
  }

  public updateAddress(address: string) {
    this.updateState({ ...this._state, address, loading: true })
  }
  public loadMore() {
    const pagination = { ...this._state.pagination, currentPage: this._state.pagination.currentPage + 1 }
    this.updateState({ ...this._state, pagination, loading: true })
  }
}
