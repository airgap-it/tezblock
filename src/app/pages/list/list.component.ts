import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { merge, Observable, of, timer } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import { BaseComponent } from '@tezblock/components/base.component'
import { BlockService } from '@tezblock/services/blocks/blocks.service'
import { TransactionService } from '@tezblock/services/transaction/transaction.service'
import { Tab } from '@tezblock/components/tabbed-table/tabbed-table.component'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { refreshRate } from '@tezblock/services/facade/facade'
import { LayoutPages, OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  tabs: Tab[]
  page: string
  loading$: Observable<boolean>
  type: string
  data$: Observable<Object>
  componentView: string | undefined
  transactionsLoading$: Observable<boolean>
  showLoadMore$: Observable<boolean>
  totalActiveBakers$: Observable<number>

  private get routeName(): string {
    return this.route.snapshot.paramMap.get('route')
  }

  private dataService

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    const refresh$ = merge(
      of(1),
      merge(
        this.actions$.pipe(ofType(actions.loadActiveBakersFailed)),
        this.actions$.pipe(ofType(actions.loadActiveBakersSucceeded)),
        this.actions$.pipe(ofType(actions.loadDoubleBakingsFailed)),
        this.actions$.pipe(ofType(actions.loadDoubleBakingsSucceeded)),
        this.actions$.pipe(ofType(actions.loadDoubleEndorsementsFailed)),
        this.actions$.pipe(ofType(actions.loadDoubleEndorsementsSucceeded))
      ).pipe(switchMap(() => timer(refreshRate, refreshRate)))
    )

    this.route.params.subscribe(params => {
      try {
        switch (params.route) {
          case 'block':
            this.dataService = new BlockService(this.apiService)
            this.dataService.setPageSize(10)
            this.page = 'block'
            this.setupTable(params.route, 'overview')
            this.showLoadMore$ = of(true)
            break
          case 'transaction':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'overview')
            this.showLoadMore$ = of(true)
            break
          case 'activation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['activate_account'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'activate_account')
            this.showLoadMore$ = of(true)
            break
          case 'origination':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['origination'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'origination_overview')
            this.showLoadMore$ = of(true)
            break
          case 'delegation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['delegation'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'delegation_overview')
            this.showLoadMore$ = of(true)
            break
          case 'endorsement':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['endorsement'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'endorsement_overview')
            this.showLoadMore$ = of(true)
            break
          case 'vote':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['ballot', 'proposals'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'ballot_overview')
            this.showLoadMore$ = of(true)
            break
          case 'double-baking':
            this.subscriptions.push(refresh$.subscribe(() => this.store$.dispatch(actions.loadDoubleBakings())))
            this.loading$ = this.store$.select(state => state.list.doubleBakings.loading)
            this.data$ = this.store$.select(state => state.list.doubleBakings.data)
            this.page = 'transaction'
            this.type = 'double_baking_evidence_overview'
            this.showLoadMore$ = of(true)
            break
          case 'double-endorsement':
            this.subscriptions.push(refresh$.subscribe(() => this.store$.dispatch(actions.loadDoubleEndorsements())))
            this.loading$ = this.store$.select(state => state.list.doubleEndorsements.loading)
            this.data$ = this.store$.select(state => state.list.doubleEndorsements.data)
            this.page = 'transaction'
            this.type = 'double_endorsement_evidence_overview'
            this.showLoadMore$ = of(true)
            break
          case 'bakers':
            this.subscriptions.push(
              refresh$.subscribe(() => {
                this.store$.dispatch(actions.loadActiveBakers())
                this.store$.dispatch(actions.loadTotalActiveBakers())
              })
            )
            this.loading$ = this.store$.select(state => state.list.activeBakers.loading)
            this.data$ = this.store$.select(state => state.list.activeBakers.data)
            this.page = 'account'
            this.type = 'baker_overview'
            this.totalActiveBakers$ = this.store$.select(state => state.list.activeBakers.pagination.total)
            this.showLoadMore$ = of(true)
            break
          case 'proposal':
            this.subscriptions.push(refresh$.subscribe(() => this.store$.dispatch(actions.loadProposals())))
            this.loading$ = this.store$.select(state => state.list.proposals.loading)
            this.data$ = this.store$.select(state => state.list.proposals.data)
            this.showLoadMore$ = this.store$
              .select(state => state.list.proposals)
              .pipe(
                map(
                  proposals =>
                    Array.isArray(proposals.data) &&
                    proposals.pagination.currentPage * proposals.pagination.selectedSize === proposals.data.length
                )
              )
            this.page = LayoutPages.Transaction
            this.type = OperationTypes.ProposalOverview
            break
          default:
            throw new Error('unknown route')
        }
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn(error)
      }
    })
  }

  loadMore() {
    switch (this.routeName) {
      case 'double-baking':
        this.store$.dispatch(actions.increasePageOfDoubleBakings())
        break
      case 'double-endorsement':
        this.store$.dispatch(actions.increasePageOfDoubleEndorsements())
        break
      case 'bakers':
        this.store$.dispatch(actions.increasePageOfActiveBakers())
        break
      case 'proposal':
        this.store$.dispatch(actions.increasePageOfProposals())
        break
      default:
        ;(this.dataService as any).loadMore()
    }
  }

  private setupTable(route: string, type: string) {
    this.type = type
    this.loading$ = this.dataService.loading$
    this.data$ = this.dataService.list$
    this.componentView = route
  }
}
