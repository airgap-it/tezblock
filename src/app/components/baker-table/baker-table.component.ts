import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { TezosNetwork, TezosRewards, TezosPayoutInfo } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { combineLatest, Observable, EMPTY } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseComponent } from '@tezblock/components/base.component'
import { Transaction } from './../../interfaces/Transaction'
import { ApiService } from './../../services/api/api.service'
import { Reward, Payout } from '@tezblock/domain/reward'
import { AggregatedEndorsingRights, EndorsingRights } from '@tezblock/interfaces/EndorsingRights'
import { AggregatedBakingRights, BakingRights } from '@tezblock/interfaces/BakingRights'
import { OperationTypes } from '@tezblock/domain/operations'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { columns } from './table-definitions'
import { Column, Template, ExpandedRow } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { Count, kindToOperationTypes, Tab, updateTabCounts } from '@tezblock/domain/tab'
import { getRefresh } from '@tezblock/domain/synchronization'
import { first } from '@tezblock/services/fp'
import { toClientsideDataScource, DataSource, Pagination } from '@tezblock/domain/table'
import { RewardService } from '@tezblock/services/reward/reward.service'

// TODO: ask Pascal if this override payout logic is needed
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
  styleUrls: ['./baker-table.component.scss']
})
export class BakerTableComponent extends BaseComponent implements OnInit {
  @ViewChild('expandedRowTemplate', { static: true }) expandedRowTemplate: TemplateRef<any>
  @ViewChild('rewardsExpandedRowHeaderTemplate', { static: true }) rewardsExpandedRowHeaderTemplate: TemplateRef<any>
  private _tabs: Tab[] | undefined = []
  selectedTab: Tab | undefined = undefined
  transactions$: Observable<Transaction[]>

  rewardsLoading$: Observable<boolean>
  rightsLoading$: Observable<boolean>
  accountLoading$: Observable<boolean>

  rewards$: Observable<TezosRewards[]>
  bakerReward$: Observable<{ [key: string]: TezosPayoutInfo }>
  isBakerRewardBusy$: Observable<{ [key: string]: boolean }>
  rights$: Observable<(AggregatedBakingRights | AggregatedEndorsingRights)[]>
  upcomingRights$: Observable<actions.UpcomingRights>
  upcomingRightsLoading$: Observable<boolean>
  votes$: Observable<Transaction[]>
  votesLoading$: Observable<boolean>
  votesShowLoadMore$: Observable<boolean>

  efficiencyLast10Cycles$: Observable<number>
  efficiencyLast10CyclesLoading$: Observable<boolean>

  activeDelegations$: Observable<number>
  isRightsTabAvailable$: Observable<boolean>

  frozenBalance$: Observable<number>
  rewardsExpandedRow: ExpandedRow<TezosRewards>

  get rightsExpandedRow(): ExpandedRow<AggregatedBakingRights> | ExpandedRow<AggregatedEndorsingRights> {
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
  }

  get tabs() {
    if (this._tabs) {
      return this._tabs
    } else {
      return []
    }
  }

  @Input() address: string

  @Input() data: any

  @Input() ratings: any

  @Input() bakerFee$: Observable<number>

  rewardsColumns: Column[]
  rewardsFields: string[]

  get rightsColumns(): Column[] {
    return this.selectedTab.kind === OperationTypes.BakingRights ? this.bakingRightsColumns : this.endorsingRightsColumns
  }

  get rightsFields(): string[] {
    return this.selectedTab.kind === OperationTypes.BakingRights ? this.bakingRightsFields : this.endorsingRightsFields
  }

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  private bakingRightsColumns: Column[]
  private bakingRightsFields: string[]
  private endorsingRightsColumns: Column[]
  private endorsingRightsFields: string[]
  private bakingRightsExpandedRow: ExpandedRow<AggregatedBakingRights>
  private endorsingRightsExpandedRow: ExpandedRow<AggregatedEndorsingRights>

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()

    this.store$.dispatch(actions.reset())

    this.subscriptions.push(
      this.route.paramMap.subscribe(async paramMap => {
        const accountAddress = paramMap.get('id')

        this.store$.dispatch(actions.setAccountAddress({ accountAddress }))
        this.store$.dispatch(actions.loadBakingRights())
        this.store$.dispatch(actions.loadEndorsingRights())
        this.store$.dispatch(actions.loadCurrentCycleThenRights())
        this.store$.dispatch(actions.loadEfficiencyLast10Cycles())
        this.store$.dispatch(actions.loadUpcomingRights())
        this.frozenBalance$ = this.apiService.getFrozenBalance(accountAddress)
      })
    )
  }

  ngOnInit() {
    this.rights$ = this.store$
      .select(state => state.bakerTable.kind)
      .pipe(
        switchMap(kind => {
          if (kind === OperationTypes.BakingRights) {
            return this.store$.select(state => state.bakerTable.bakingRights.data)
          }

          if (kind === OperationTypes.EndorsingRights) {
            return this.store$.select(state => state.bakerTable.endorsingRights.data)
          }

          return EMPTY
        })
      )

    this.rewards$ = this.store$.select(state => state.bakerTable.rewards.data)
    // combineLatest(
    //   this.store$.select(state => state.bakerTable.rewards.data),
    //   this.bakerFee$
    // ).pipe(
    //   filter(([rewards, bakerFee]) => bakerFee !== undefined),
    //   map(([rewards, bakerFee]) => subtractFeeFromPayout(rewards, bakerFee))
    // )
    this.bakerReward$ = this.store$.select(state => state.bakerTable.bakerReward)
    this.isBakerRewardBusy$ = this.store$.select(state => state.bakerTable.busy.bakerReward)
    this.rightsLoading$ = combineLatest(
      this.store$.select(state => state.bakerTable.bakingRights.loading),
      this.store$.select(state => state.bakerTable.endorsingRights.loading)
    ).pipe(map(([bakingRightsLoading, endorsingRightsLoading]) => bakingRightsLoading || endorsingRightsLoading))
    this.rewardsLoading$ = this.store$.select(state => state.bakerTable.rewards.loading)
    this.accountLoading$ = this.store$.select(state => state.bakerTable.busy.activeDelegations)
    this.activeDelegations$ = this.store$.select(state => state.bakerTable.activeDelegations)
    this.efficiencyLast10Cycles$ = this.store$.select(state => state.bakerTable.efficiencyLast10Cycles)
    this.efficiencyLast10CyclesLoading$ = this.store$.select(state => state.bakerTable.busy.efficiencyLast10Cycles)
    this.upcomingRights$ = this.store$.select(state => state.bakerTable.upcomingRights)
    this.upcomingRightsLoading$ = this.store$.select(state => state.bakerTable.busy.upcomingRights)
    this.isRightsTabAvailable$ = this.store$
      .select(state => state.bakerTable.upcomingRights)
      .pipe(
        map(upcomingRights =>
          !upcomingRights
            ? true
            : this.selectedTab.kind === 'baking_rights'
            ? upcomingRights.baking !== null
            : upcomingRights.endorsing !== null
        )
      )
    this.votes$ = this.store$.select(state => state.bakerTable.votes.data)
    this.votesLoading$ = this.store$.select(state => state.bakerTable.votes.loading)
    this.votesShowLoadMore$ = this.store$
      .select(state => state.bakerTable.votes)
      .pipe(map(votes => (votes.data || []).length !== votes.pagination.total))

    this.setupExpandedRows()
    this.setupTables()

    this.subscriptions.push(
      this.route.paramMap
        .pipe(
          filter(paramMap => !!paramMap.get('id')),
          switchMap(() =>
            getRefresh([
              this.actions$.pipe(ofType(actions.loadActiveDelegationsSucceeded)),
              this.actions$.pipe(ofType(actions.loadActiveDelegationsFailed))
            ])
          )
        )
        .subscribe(() => this.store$.dispatch(actions.loadActiveDelegations())),

      /* TODO: strange error on page transition: account-detail -> account-detail
        "3 errors occurred during unsubscription:
        1) TypeError: Cannot assign to read only property 'eventTask' of object '[object Object]'
        2) TypeError: Cannot assign to read only property 'eventTask' of object '[object Object]'
        3) TypeError: Cannot assign to read only property 'macroTask' of object '[object Object]'"

        SOLVED BY: ( https://github.com/ngrx/platform/issues/664 )
        StoreModule.forRoot(ROOT_REDUCERS, {
          metaReducers,
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: false // true is default <----------------------------- !!!
          }
        }),
      */
      this.route.paramMap
        .pipe(
          filter(paramMap => !!paramMap.get('id')),
          switchMap(() =>
            getRefresh([this.actions$.pipe(ofType(actions.loadRewardsSucceeded)), this.actions$.pipe(ofType(actions.loadRewardsFailed))])
          )
        )
        .subscribe(() => this.store$.dispatch(actions.loadRewards())),

      // using account-detail functionality
      this.store$
        .select(state => state.accountDetails.counts)
        .pipe(filter(counts => !!counts))
        .subscribe(this.updateVotesCount.bind(this))
    )
  }

  selectTab(selectedTab: Tab) {
    this.store$.dispatch(actions.kindChanged({ kind: kindToOperationTypes(selectedTab.kind) }))
    this.updateSelectedTab(selectedTab)

    if (selectedTab.kind === 'ballot' /* votes */) {
      this.store$.dispatch(actions.loadVotes())
    }
  }

  loadMoreRights() {
    this.store$.dispatch(actions.increaseRightsPageSize())
  }

  loadMoreRewards() {
    this.store$.dispatch(actions.increaseRewardsPageSize())
  }

  loadMoreVotes() {
    this.store$.dispatch(actions.increaseVotesPageSize())
  }

  isTabDisabled(tab: Tab) {
    if (tab.kind !== 'ballot') {
      return false
    }

    return tab.disabled()
  }

  onRowExpanded(reward: TezosRewards) {
    const { baker, cycle } = reward

    this.store$.dispatch(actions.loadBakerReward({ baker, cycle }))
  }

  private updateSelectedTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = tab === selectedTab))
    this.selectedTab = selectedTab
  }

  private setupTables() {
    this.bakingRightsColumns = columns[OperationTypes.BakingRights]({ showFiatValue: this.isMainnet })
    this.bakingRightsFields = this.bakingRightsColumns.map(column => column.field)

    this.endorsingRightsColumns = columns[OperationTypes.EndorsingRights]({ showFiatValue: this.isMainnet })
    this.endorsingRightsFields = this.endorsingRightsColumns.map(column => column.field)

    this.rewardsColumns = columns[OperationTypes.Rewards]({ showFiatValue: this.isMainnet })
    this.rewardsFields = this.rewardsColumns.map(column => column.field)
  }

  private setupExpandedRows() {
    this.rewardsExpandedRow = {
      template: this.expandedRowTemplate,
      getContext: (item: TezosRewards) => ({
        columns: [
          {
            name: 'Delegator Account',
            field: 'delegator',
            template: Template.address,
            data: (item: Payout) => ({ data: item.delegator })
          },
          {
            name: 'Payout',
            field: 'payout',
            template: Template.amount,
            data: (item: Payout) => ({ data: { amount: item.payout } })
          },
          { name: 'Share', field: 'share', template: Template.percentage }
        ],
        dataSource: this.getRewardsInnerDataSource(item.cycle),
        headerTemplate: this.rewardsExpandedRowHeaderTemplate,
        headerContext: this.store$.select(fromRoot.bakerTable.bakerReward(item.cycle))
      }),
      primaryKey: 'cycle'
    }

    this.bakingRightsExpandedRow = {
      template: this.expandedRowTemplate,
      getContext: (item: AggregatedBakingRights) => ({
        columns: [
          { name: 'Cycle', field: 'cycle' },
          { name: 'Age', field: 'estimated_time', template: Template.timestamp },
          { name: 'Level', field: 'level', template: Template.block },
          { name: 'Priority', field: 'priority' },
          {
            name: 'Rewards',
            field: 'rewards',
            template: Template.amount,
            data: (item: BakingRights) => ({ data: { amount: item.rewards } })
          },
          { name: 'Fees', field: 'fees', template: Template.amount, data: (item: BakingRights) => ({ data: { amount: item.fees } }) },
          {
            name: 'Deposits',
            field: 'deposit',
            template: Template.amount,
            data: (item: BakingRights) => ({ data: { amount: item.deposit } })
          }
        ],
        dataSource: toClientsideDataScource(item.items)
      }),
      primaryKey: 'cycle'
    }

    this.endorsingRightsExpandedRow = {
      template: this.expandedRowTemplate,
      getContext: (item: AggregatedEndorsingRights) => ({
        columns: [
          { name: 'Cycle', field: 'cycle' },
          { name: 'Age', field: 'estimated_time', template: Template.timestamp },
          { name: 'Level', field: 'level', template: Template.block },
          { name: 'Slot', field: 'slot' },
          {
            name: 'Rewards',
            field: 'rewards',
            template: Template.amount,
            data: (item: EndorsingRights) => ({ data: { amount: item.rewards }, options: { showFiatValue: true } })
          },
          {
            name: 'Deposits',
            field: 'deposit',
            template: Template.amount,
            data: (item: EndorsingRights) => ({ data: { amount: item.deposit }, options: { showFiatValue: true } })
          }
        ],
        dataSource: this.getEndorsingRightsInnerDataSource(item.cycle)
      }),
      primaryKey: 'cycle'
    }
  }

  private updateVotesCount(counts: Count[]) {
    const votesTab = this.tabs.find(tab => tab.kind === 'ballot')
    const updatedTab = first(updateTabCounts([votesTab], counts))

    votesTab.count = updatedTab.count
  }

  private getRewardsInnerDataSource(cycle: number): DataSource<TezosPayoutInfo> {
    return {
      get: (pagination: Pagination, filter?: any) => {
        const rewards = fromRoot.getState(this.store$).bakerTable.rewards.data.find(_reward => _reward.cycle === cycle)

        return this.rewardService.getRewardsPayouts(rewards, pagination, filter)
      },
      isFilterable: true
    }
  }

  private getEndorsingRightsInnerDataSource(cycle: number): DataSource<EndorsingRights> {
    return {
      get: (pagination: Pagination, filter?: any) => {
        this.store$.dispatch(actions.loadEndorsingRightItems({ baker: this.address, cycle }))

        return this.store$
          .select(state => state.bakerTable.endorsingRightItems)
          .pipe(
            map(response => {
              const offset = pagination ? (pagination.currentPage - 1) * pagination.selectedSize : 0
              const limit = pagination ? pagination.selectedSize : Number.MAX_SAFE_INTEGER
              const _response = response[cycle]

              return _response
                ? {
                    data: _response.slice(offset, Math.min(offset + limit, _response.length)),
                    total: _response.length
                  }
                : { data: undefined, total: 0 }
            })
          )
      },
      isFilterable: false
    }
  }
}
