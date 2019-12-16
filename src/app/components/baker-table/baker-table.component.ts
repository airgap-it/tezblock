import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { Transaction } from './../../interfaces/Transaction'
import { AccountSingleService } from './../../services/account-single/account-single.service'
import { AccountService } from './../../services/account/account.service'
import { ApiService } from './../../services/api/api.service'
import { RewardSingleService } from './../../services/reward-single/reward-single.service'
import { RightsSingleService } from './../../services/rights-single/rights-single.service'
import { ExpandedRow } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Payout } from '@tezblock/interfaces/Payout'
import { ExpTezosRewards } from '@tezblock/services/reward/reward.service'
import { AggregatedEndorsingRights, EndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { AggregatedBakingRights, BakingRights } from '@tezblock/interfaces/BakingRights'
import { OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { groupBy } from '@tezblock/services/fp'

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

  rewards$: Observable<TezosRewards[]>
  rights$: Observable<(AggregatedBakingRights | AggregatedEndorsingRights)[]>

  rewards: TezosRewards

  activeDelegations$: Observable<number>

  myTBUrl: string | undefined
  address: string
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
    if (this.selectedTab.kind === OperationTypes.BakingRights) {
      return {
        columns: [
          { name: 'Delegator Account', property: 'delegator', component: 'address-cell' },
          { name: 'Payout', property: 'payout', component: 'address-cell' },
          { name: 'Share', property: 'share', component: 'pipe:percentage' }
        ],
        key: 'block_hash',
        dataSelector: entity => entity.items,
        filterCondition: (detail, query) => detail.block_hash === query
      }
    }

    return {
      columns: [
        { name: 'Delegator Account', property: 'delegator', component: 'address-cell' },
        { name: 'Payout', property: 'payout', component: 'address-cell' },
        { name: 'Share', property: 'share', component: 'pipe:percentage' }
      ],
      key: 'block_hash',
      dataSelector: entity => entity.items,
      filterCondition: (detail, query) => detail.block_hash === query
    }
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

  @Output()
  readonly overviewTabClicked: EventEmitter<string> = new EventEmitter()

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
    this.rightsSingleService.updateAddress(this.address)

    this.rights$ = this.rightsSingleService.rights$.pipe(map(this.aggregateRights.bind(this)))
    this.rewards$ = this.rewardSingleService.rewards$
    this.rightsLoading$ = this.rightsSingleService.loading$
    this.rewardsLoading$ = this.rewardSingleService.loading$
    this.accountLoading$ = this.accountSingleService.loading$

    this.activeDelegations$ = this.accountSingleService.activeDelegations$
  }

  async ngOnInit() {
    const address: string = this.route.snapshot.params.id

    this.rewardSingleService.updateAddress(address)

    this.accountSingleService.setAddress(address)

    this.frozenBalance = await this.accountService.getFrozen(address)
  }

  selectTab(selectedTab: Tab) {
    this.rightsSingleService.updateKind(selectedTab.kind)
    this.updateSelectedTab(selectedTab)
    this.overviewTabClicked.emit(selectedTab.kind)
  }

  goToMYTB() {
    if (this.myTBUrl) {
      window.open(this.myTBUrl, '_blank')
    }
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
    this.rightsSingleService.loadMore()
  }

  loadMoreRewards(): void {
    this.rewardSingleService.loadMore()
  }

  private updateSelectedTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = tab === selectedTab))
    this.selectedTab = selectedTab
  }

  private aggregateRights(rights: (BakingRights | EndorsingRights)[]): (AggregatedBakingRights | AggregatedEndorsingRights)[] {
    const group = groupBy('cycle')

    if (this.selectedTab.kind === OperationTypes.BakingRights) {
      const bakingRights = <BakingRights[]>rights

      return Object.entries(group(bakingRights)).map(
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
    }

    const endorsingRights = <EndorsingRights[]>rights

    return Object.entries(group(endorsingRights)).map(
      ([cycle, items]) =>
        <AggregatedEndorsingRights>{
          cycle: parseInt(cycle),
          endorsementsCount: (<any[]>items).length,
          endorsementRewards: undefined,
          deposits: undefined,
          items
        }
    )
  }
}
