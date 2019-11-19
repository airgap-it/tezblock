import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, timer } from 'rxjs'
import { Store } from '@ngrx/store'

import { BaseComponent } from '@tezblock/components/base.component'
import { BlockService } from '@tezblock/services/blocks/blocks.service'
import { TransactionService } from '@tezblock/services/transaction /transaction.service'
import { Tab } from '@tezblock/components/tabbed-table/tabbed-table.component'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { refreshRate } from '@tezblock/services/facade/facade'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  public tabs: Tab[]
  public page: string
  public loading$: Observable<boolean>
  public type: string
  private dataService
  public data$: Observable<Object>
  public componentView: string | undefined
  public transactionsLoading$: Observable<boolean>

  private get routeName(): string {
    return this.route.snapshot.paramMap.get('route')
  }

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()

    this.route.params.subscribe(params => {
      try {
        switch (params.route) {
          case 'block':
            this.dataService = new BlockService(this.apiService)
            this.dataService.setPageSize(10)
            this.page = 'block'
            this.setupTable(params.route, 'overview')
            break
          case 'transaction':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'overview')
            break
          case 'activation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['activate_account'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'activate_account')
            break
          case 'origination':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['origination'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'origination_overview')
            break
          case 'delegation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['delegation'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'delegation_overview')
            break
          case 'endorsement':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['endorsement'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'endorsement_overview')
            break
          case 'vote':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['ballot', 'proposals'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.setupTable(params.route, 'ballot_overview')
            break
          case 'double-baking':
          case 'double-endorsement':
            break
          default:
            throw new Error('unknown route')
        }
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn(error)
      }
    })

    // Why this line was needed ?
    // this.dataService.setPageSize(10)
  }

  ngOnInit() {
    switch (this.routeName) {
      case 'double-baking':
        this.subscriptions.push(timer(0, refreshRate).subscribe(() => this.store$.dispatch(actions.loadDoubleBakings())))
        this.loading$ = this.store$.select(state => state.list.doubleBakings.loading)
        this.data$ = this.store$.select(state => state.list.doubleBakings.data)
        this.page = 'transaction'
        this.type = 'double_baking_evidence_overview'
        break
      case 'double-endorsement':
        this.subscriptions.push(timer(0, refreshRate).subscribe(() => this.store$.dispatch(actions.loadDoubleEndorsements())))
        this.loading$ = this.store$.select(state => state.list.doubleEndorsements.loading)
        this.data$ = this.store$.select(state => state.list.doubleEndorsements.data)
        this.page = 'transaction'
        this.type = 'double_endorsement_evidence_overview'
        break
    }
  }

  loadMore() {
    switch (this.routeName) {
      case 'double-baking':
        this.store$.dispatch(actions.increasePageOfDoubleBakings())
        break
      case 'double-endorsement':
        this.store$.dispatch(actions.increasePageOfDoubleEndorsements())
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
