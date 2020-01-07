import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { combineLatest, Observable, EMPTY } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import { BaseComponent } from '@tezblock/components/base.component'
import { Transaction } from './../../interfaces/Transaction'
import { AccountSingleService } from './../../services/account-single/account-single.service'
import { AccountService } from './../../services/account/account.service'
import { ApiService } from './../../services/api/api.service'
import { RewardSingleService, Reward } from './../../services/reward-single/reward-single.service'
import { ExpandedRow } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Payout } from '@tezblock/interfaces/Payout'
import { ExpTezosRewards } from '@tezblock/services/reward/reward.service'
import { AggregatedEndorsingRights, EndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { AggregatedBakingRights, BakingRights } from '@tezblock/interfaces/BakingRights'
import { OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'

export interface Tab {
  title: string
  active: boolean
  kind: string
  icon?: string[]
  count: number
}

const subtractFeeFromPayout = (rewards: Reward[], bakerFee: number): Reward[] =>
  rewards.map(reward => ({
    ...reward,
    payouts: reward.payouts.map(payout => {
      const payoutValue = parseFloat(payout.payout)
      const payoutMinusFee = payoutValue > 0 && bakerFee ? payoutValue - payoutValue * (bakerFee / 100) : payoutValue

      return {
        ...payout,
        payout: payoutMinusFee.toString()
      }
    })
  }))

@Component({
  selector: 'baker-table',
  templateUrl: './baker-table.component.html',
  styleUrls: ['./baker-table.component.scss'],
  providers: [AccountSingleService, RewardSingleService]
})
export class BakerTableComponent extends BaseComponent implements OnInit {
  private _tabs: Tab[] | undefined = []
  selectedTab: Tab | undefined = undefined
  transactions$: Observable<Transaction[]>

  bakingBadRating: string | undefined
  tezosBakerRating: string | undefined
  stakingBalance: number | undefined
  numberOfRolls: number | undefined
  payoutAddress: string | undefined

  bakingInfos: any
  stakingCapacity: number | undefined
  stakingProgress: number | undefined
  stakingBond: number | undefined

  isValidBaker: boolean | undefined
  rewardsLoading$: Observable<boolean>
  rightsLoading$: Observable<boolean>
  accountLoading$: Observable<boolean>

  rewards$: Observable<Reward[]>
  rights$: Observable<(AggregatedBakingRights | AggregatedEndorsingRights)[]>

  efficiencyLast10Cycles$: Observable<number>
  efficiencyLast10CyclesLoading$: Observable<boolean>

  activeDelegations$: Observable<number>

  frozenBalance: number | undefined
  rewardsExpandedRow: ExpandedRow<ExpTezosRewards, Payout> = {
    columns: [
      { name: 'Delegator Account', property: 'delegator', component: 'address-cell' },
      { name: 'Payout', property: 'payout', component: 'amount-cell' },
      { name: 'Share', property: 'share', component: 'pipe:percentage' }
    ],
    key: 'cycle',
    dataSelector: entity => entity.payouts,
    filterCondition: (detail, query) => detail.delegator === query
  }
  get rightsExpandedRow(): ExpandedRow<AggregatedBakingRights, BakingRights> | ExpandedRow<AggregatedEndorsingRights, EndorsingRights> {
    return this.selectedTab.kind === OperationTypes.BakingRights ? this.bakingRightsExpandedRow : this.endorsingRightsExpandedRow
  }

  get accountAddress(): string {
    return this.route.snapshot.paramMap.get('id')
  }

  @Input()
  page: string = 'account'

  @Input()
  set tabs(tabs: Tab[]) {
    this._tabs = tabs

    if (!this.selectedTab) {
      this.updateSelectedTab(tabs[0])
    }

    this.getTabCount(tabs)
  }

  get tabs() {
    if (this._tabs) {
      return this._tabs
    } else {
      return []
    }
  }

  @Input()
  set data(bakerTableInfos: any) {
    if (bakerTableInfos) {
      this.stakingBalance = bakerTableInfos.stakingBalance
      this.stakingCapacity = bakerTableInfos.stakingCapacity
      this.stakingProgress = bakerTableInfos.stakingProgress
      this.stakingBond = bakerTableInfos.stakingBond
      this.frozenBalance = bakerTableInfos.frozenBalance
      this.numberOfRolls = bakerTableInfos.numberOfRolls
      this.payoutAddress = bakerTableInfos.payoutAddress
    }
  }

  @Input()
  set ratings(bakerTableRatings: any) {
    if (bakerTableRatings) {
      this.tezosBakerRating = bakerTableRatings.tezosBakerRating
      this.bakingBadRating = bakerTableRatings.bakingBadRating
    }
  }

  @Input() bakerFee$: Observable<number>

  @Output()
  readonly overviewTabClicked: EventEmitter<string> = new EventEmitter()

  private bakingRightsExpandedRow: ExpandedRow<AggregatedBakingRights, BakingRights> = {
    columns: [
      { name: 'Cycle', property: 'cycle', component: null },
      { name: 'Age', property: 'estimated_time', component: 'app-timestamp-cell' },
      { name: 'Level', property: 'level', component: 'app-block-cell' },
      { name: 'Priority', property: 'priority', component: null },
      { name: 'Rewards', property: 'rewards', component: 'amount-cell' },
      { name: 'Fees', property: null, component: 'amount-cell' },
      { name: 'Deposits', property: null, component: 'amount-cell' }
    ],
    key: 'cycle',
    dataSelector: entity => entity.items,
    filterCondition: (detail, query) => detail.block_hash === query
  }
  private endorsingRightsExpandedRow: ExpandedRow<AggregatedEndorsingRights, EndorsingRights> = {
    columns: [
      { name: 'Cycle', property: 'cycle', component: null },
      { name: 'Age', property: 'estimated_time', component: 'app-timestamp-cell' },
      { name: 'Level', property: 'level', component: 'app-block-cell' },
      { name: 'Slot', property: 'slot', component: null },
      { name: 'Rewards', property: 'rewards', component: 'amount-cell' },
      { name: 'Deposits', property: null, component: 'amount-cell' }
    ],
    key: 'cycle',
    dataSelector: entity => entity.items,
    filterCondition: (detail, query) => detail.block_hash === query
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountService: AccountService,
    private readonly accountSingleService: AccountSingleService,
    private readonly rewardSingleService: RewardSingleService,
    private readonly apiService: ApiService,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()

    this.store$.dispatch(actions.reset())

    this.subscriptions.push(
      this.route.paramMap.subscribe(async paramMap => {
        const accountAddress = paramMap.get('id')
        this.store$.dispatch(actions.setAccountAddress({ accountAddress }))
        this.store$.dispatch(actions.loadCurrentCycleThenRights())
        this.store$.dispatch(actions.loadEfficiencyLast10Cycles())
        this.rewardSingleService.updateAddress(accountAddress)
        this.accountSingleService.setAddress(accountAddress)
        this.frozenBalance = await this.accountService.getFrozen(accountAddress)
      })
    )
  }

  async ngOnInit() {
    this.rights$ = this.store$
      .select(state => state.bakerTable.kind)
      .pipe(
        switchMap(kind => {
          if (kind === OperationTypes.BakingRights) {
            return this.store$.select(state => state.bakerTable.bakingRights).pipe(map(table => table.data))
          }

          if (kind === OperationTypes.EndorsingRights) {
            return this.store$.select(state => state.bakerTable.endorsingRights).pipe(map(table => table.data))
          }

          return EMPTY
        })
      )
    this.rewards$ = combineLatest(this.rewardSingleService.rewards$, this.bakerFee$).pipe(
      filter(([rewards, bakerFee]) => bakerFee !== undefined),
      map(([rewards, bakerFee]) => subtractFeeFromPayout(rewards, bakerFee))
    )
    this.rightsLoading$ = combineLatest(
      this.store$.select(state => state.bakerTable.bakingRights.loading),
      this.store$.select(state => state.bakerTable.endorsingRights.loading)
    ).pipe(map(([bakingRightsLoading, endorsingRightsLoading]) => bakingRightsLoading || endorsingRightsLoading))
    this.rewardsLoading$ = this.rewardSingleService.loading$
    this.accountLoading$ = this.accountSingleService.loading$
    this.activeDelegations$ = this.accountSingleService.activeDelegations$
    this.efficiencyLast10Cycles$ = this.store$.select(state => state.bakerTable.efficiencyLast10Cycles)
    this.efficiencyLast10CyclesLoading$ = this.store$.select(state => state.bakerTable.busy.efficiencyLast10Cycles)
  }

  selectTab(selectedTab: Tab) {
    this.store$.dispatch(actions.kindChanged({ kind: selectedTab.kind }))
    this.updateSelectedTab(selectedTab)
    this.overviewTabClicked.emit(selectedTab.kind)
  }

  getTabCount(tabs: Tab[]) {
    let ownId: string = this.router.url
    const split = ownId.split('/')
    ownId = split.slice(-1).pop()

    const aggregateFunction = info => {
      let tab = tabs.find(tabArgument => tabArgument.kind === info.kind)
      if (info.kind === 'proposals') {
        tab = tabs.find(tabArgument => tabArgument.kind === 'ballot')
      }
      if (tab) {
        const count = parseInt(info.count_operation_group_hash, 10)
        tab.count = tab.count ? tab.count + count : count
      }
    }

    const setFirstActiveTab = () => {
      const firstActiveTab = this.tabs.find(tab => tab.count > 0)
      if (firstActiveTab) {
        this.selectTab(firstActiveTab)
      }
    }

    if (this.page === 'transaction') {
      const transactionPromise = this.apiService.getOperationCount('operation_group_hash', ownId).toPromise()

      transactionPromise
        .then(transactionCounts => {
          transactionCounts.forEach(aggregateFunction)

          setFirstActiveTab()
        })
        .catch(console.error)
    }
  }

  loadMoreRights(): void {
    this.store$.dispatch(actions.increaseRightsPageSize())
  }

  loadMoreRewards(): void {
    this.rewardSingleService.loadMore()
  }

  private updateSelectedTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = tab === selectedTab))
    this.selectedTab = selectedTab
  }
}
