import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { forkJoin, Observable, of } from 'rxjs'
import { map, switchMap, catchError, filter } from 'rxjs/operators'
import * as _ from 'lodash'

import { ApiService, OperationCount } from '@tezblock/services/api/api.service'
import { LayoutPages, OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { TransactionSingleService } from '@tezblock/services/transaction-single/transaction-single.service'
import { BaseComponent } from '@tezblock/components/base.component'

type kindType = string | string[]

export interface Tab {
  title: string
  active: boolean
  count: number
  kind: kindType
  icon?: string[]
}

const getUpdatedTabs$ = (tabs: Tab[], type: LayoutPages, id: string, api: ApiService): Observable<Tab[]> => {
  const result = tabs.map(tab => ({ ...tab, count: 0 }))

  // TODO: not pure, mutates result variable
  const aggregateFunction = (info: OperationCount, field: string) => {
    const isTabKindEqualTo = (kind: string) => (tab: Tab): boolean =>
      Array.isArray(tab.kind) ? tab.kind.indexOf(kind) !== -1 : tab.kind === kind
    const tab =
      info.kind === 'proposals'
        ? result.find(isTabKindEqualTo('ballot'))
        : result.find(tabArgument =>
            Array.isArray(tabArgument.kind) ? tabArgument.kind.indexOf(info.kind) !== -1 : tabArgument.kind === info.kind
          )

    if (tab) {
      const count = parseInt(info[`count_${field}`], 10)
      tab.count = tab.count ? tab.count + count : count
    }
  }

  if (type === LayoutPages.Transaction) {
    return api.getOperationCount('operation_group_hash', id).pipe(
      map(transactionCounts => {
        transactionCounts.forEach(info => aggregateFunction(info, 'operation_group_hash'))

        return result
      })
    )
  }

  if (type === LayoutPages.Account) {
    const from$ = api.getOperationCount('source', id)
    const to$ = api.getOperationCount('destination', id)
    const delegate$ = api
      .getOperationCount('delegate', id)
      .pipe(map(counts => counts.map(count => (count.kind === 'origination' ? { ...count, kind: 'delegation' } : count))))

    return forkJoin(from$, to$, delegate$).pipe(
      map(([from, to, delegate]) => {
        from.forEach(info => aggregateFunction(info, 'source'))
        to.forEach(info => aggregateFunction(info, 'destination'))
        delegate.forEach(info => aggregateFunction(info, 'delegate'))

        return result
      })
    )
  }

  return api.getOperationCount('block_level', id).pipe(
    map(blockCounts => {
      blockCounts.forEach(info => aggregateFunction(info, 'block_level'))

      return result
    })
  )
}

@Component({
  selector: 'tabbed-table',
  templateUrl: './tabbed-table.component.html',
  styleUrls: ['./tabbed-table.component.scss']
})
export class TabbedTableComponent extends BaseComponent implements OnInit {
  @Input()
  page: string = 'account'

  selectedTab: Tab | undefined = undefined

  @Input()
  set tabs(tabs: Tab[]) {
    this._tabs = tabs

    this.updateSelectedTab()
  }

  get tabs() {
    return this._tabs || []
  }

  @Input()
  dataService?: TransactionSingleService // TODO: <any>

  @Input()
  data?: Observable<any> // TODO: <any>

  @Input()
  loading?: Observable<boolean>

  @Output()
  readonly tabClicked: EventEmitter<kindType> = new EventEmitter()

  private _tabs: Tab[] | undefined = []

  constructor(private readonly apiService: ApiService, private readonly route: ActivatedRoute) {
    super()
  }

  ngOnInit() {
    this.subscriptions.push(
      this.dataService.actionType$
        .pipe(
          switchMap(type => getUpdatedTabs$(this.tabs, type, this.route.snapshot.params.id, this.apiService)),
          filter(Array.isArray)
        )
        .subscribe(tabs => {
          this.tabs = tabs
        })
    )
  }

  updateSelectedTab(selectedTab?: Tab) {
    // user selection
    if (selectedTab && selectedTab.title !== this.selectedTab.title) {
      this.selectTab(selectedTab)

      return
    }

    // first (code) selection, on first tebs setter triggered
    if (!this.selectedTab) {
      const firstTab = this.tabs.find((tab, index) => index === 0)
      this.selectTab(firstTab)

      return
    }

    // second (code) selection, after first time counters loaded
    const firstTabWithData = this.tabs.find(tab => tab.count > 0)
    if (this.selectedTab.count === 0 && firstTabWithData) {
      this.selectTab(firstTabWithData)

      return
    }

    // on api refresh updating selection
    this.selectedTab = this.tabs.find(tab => tab.active)
  }

  private selectTab(selectedTab?: Tab) {
    this.selectedTab = selectedTab
    this.tabs.forEach(tab => (tab.active = tab === selectedTab))

    if (selectedTab.count > 0) {
      this.tabClicked.emit(selectedTab.kind)
    }
  }

  loadMore() {
    if (this.dataService && this.dataService.loadMore) {
      this.dataService.loadMore()
    }
  }

  kindToOperationTypes(kind: kindType): string {
    return Array.isArray(kind) ? OperationTypes.Ballot : kind
  }
}
