import { Injectable } from '@angular/core'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, map, switchMap, filter } from 'rxjs/operators'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { distinctPagination, Facade, Pagination } from '../facade/facade'
import { RewardService } from '../reward/reward.service'

export interface Payout {
  delegator: string
  share: string
  payout: string
}

export interface Reward extends TezosRewards {
  payouts: Payout[]
}

interface RewardSingleServiceState {
  rewards: Reward[]
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

  constructor(private readonly rewardService: RewardService) {
    super(initialState)

    this.subscription = combineLatest([this.pagination$, this.address$])
      .pipe(
        filter(([pagination, address]) => !!address),
        switchMap(([pagination, address]) =>
          this.rewardService.getRewards(address, pagination).pipe(map(rewards => [...this._state.rewards, ...rewards]))
        )
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
