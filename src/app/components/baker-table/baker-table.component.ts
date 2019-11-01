import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Observable, Subscription } from 'rxjs'

import { Transaction } from './../../interfaces/Transaction'
import { AccountSingleService } from './../../services/account-single/account-single.service'
import { AccountService } from './../../services/account/account.service'
import { ApiService } from './../../services/api/api.service'
import { BakingService } from './../../services/baking/baking.service'
import { RewardSingleService } from './../../services/reward-single/reward-single.service'
import { RightsSingleService } from './../../services/rights-single/rights-single.service'

export interface Tab {
  title: string
  active: boolean
  kind: string
  icon?: string[]
  count: number
}

@Component({
  selector: 'baker-table',
  templateUrl: './baker-table.component.html',
  styleUrls: ['./baker-table.component.scss'],
  providers: [AccountSingleService, RewardSingleService, RightsSingleService]
})
export class BakerTableComponent implements OnInit {
  private _tabs: Tab[] | undefined = []
  public selectedTab: Tab | undefined = undefined
  public transactions$: Observable<Transaction[]> = new Observable()

  public bakingBadRating: string | undefined
  public tezosBakerRating: string | undefined
  public stakingBalance: number | undefined
  public bakingInfos: any
  public stakingCapacity: number | undefined
  public stakingProgress: number | undefined
  public stakingBond: number | undefined

  public isValidBaker: boolean | undefined
  public rewardsLoading$: Observable<boolean>
  public rightsLoading$: Observable<boolean>

  public rewards$: Observable<TezosRewards[]> = new Observable()
  public rights$: Observable<Object> = new Observable()

  private readonly subscriptions: Subscription = new Subscription()
  public rewards: TezosRewards

  public myTBUrl: string | undefined
  public address: string
  public frozenBalance: number | undefined

  @Input()
  public page: string = 'account'

  @Input()
  set tabs(tabs: Tab[]) {
    this._tabs = tabs
    if (!this.selectedTab) {
      this.selectedTab = tabs[0]
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
    this.stakingBalance = bakerTableInfos.stakingBalance
    this.stakingCapacity = bakerTableInfos.stakingCapacity
    this.stakingProgress = bakerTableInfos.stakingProgress
    this.stakingBond = bakerTableInfos.stakingBond
    this.frozenBalance = bakerTableInfos.frozenBalance
  }

  @Input()
  set ratings(bakerTableRatings: any) {
    this.tezosBakerRating = bakerTableRatings.tezosBakerRating
    this.bakingBadRating = bakerTableRatings.bakingBadRating
  }

  @Output()
  public readonly overviewTabClicked: EventEmitter<string> = new EventEmitter()

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountService: AccountService,
    private readonly rightsSingleService: RightsSingleService,
    private readonly accountSingleService: AccountSingleService,
    private readonly rewardSingleService: RewardSingleService,
    private readonly apiService: ApiService
  ) {
    this.address = this.route.snapshot.params.id
    this.router.routeReuseStrategy.shouldReuseRoute = () => false
    this.rightsSingleService.updateAddress(this.address)

    this.rights$ = this.rightsSingleService.rights$
    this.rewards$ = this.rewardSingleService.rewards$
    this.rightsLoading$ = this.rightsSingleService.loading$
    this.rewardsLoading$ = this.rewardSingleService.loading$

    // this.getBakingInfos(this.address)
  }

  public async ngOnInit() {
    const address: string = this.route.snapshot.params.id

    this.rewardSingleService.updateAddress(address)

    this.accountSingleService.setAddress(address)

    this.frozenBalance = await this.accountService.getFrozen(address)
  }

  public selectTab(selectedTab: Tab) {
    this.rightsSingleService.updateKind(selectedTab.kind)
    this.tabs.forEach(tab => (tab.active = false))
    selectedTab.active = true
    this.selectedTab = selectedTab

    this.overviewTabClicked.emit(selectedTab.kind)
  }
  public goToMYTB() {
    if (this.myTBUrl) {
      window.open(this.myTBUrl, '_blank')
    }
  }
  public getTabCount(tabs: Tab[]) {
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
  public loadMoreRights(): void {
    this.rightsSingleService.loadMore()
  }

  public loadMoreRewards(): void {
    this.rewardSingleService.loadMore()
  }
}
