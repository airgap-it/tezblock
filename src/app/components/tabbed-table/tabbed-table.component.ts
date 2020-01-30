import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { forkJoin, Observable, of } from 'rxjs'
import { map, switchMap, filter, catchError } from 'rxjs/operators'

import { ApiService, OperationCount } from '@tezblock/services/api/api.service'
import { LayoutPages, OperationTypes } from '@tezblock/domain/operations'
import { BaseComponent } from '@tezblock/components/base.component'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'

// I don't like it !!!
type KindType = string | string[]

export interface Tab {
  title: string
  active: boolean
  count: number
  kind: KindType
  icon?: string[]
  columns?: Column[]
}

const toLowerCase = (value: string): string => (value ? value.toLowerCase() : value)
const compareTabWith = (anotherTabTitle: string) => (tab: Tab) => toLowerCase(tab.title) === toLowerCase(anotherTabTitle)

export const kindToOperationTypes = (kind: KindType): string => (Array.isArray(kind) ? OperationTypes.Ballot : kind)

@Component({
  selector: 'tabbed-table',
  templateUrl: './tabbed-table.component.html',
  styleUrls: ['./tabbed-table.component.scss']
})
export class TabbedTableComponent extends BaseComponent implements OnInit {
  @Input()
  set tabs(value: Tab[]) {
    if (value !== this._tabs) {
      const selectedTab = value.find(tab => tab.active)

      this._tabs = value
      this.updateSelectedTab(selectedTab)
    }
  }

  get tabs() {
    return this._tabs || []
  }

  // ????
  @Input()
  set counts(value: number[]) {
    if (value !== this._counts) {
      this._counts = value
    }
  }

  get counts(): number[] {
    return this._counts || this.tabs.length > 0 ? [...Array(this.tabs.length)] : undefined
  }

  private _counts: number[]

  @Input()
  actionType$: Observable<LayoutPages>

  @Input()
  data: any[]

  @Input()
  loading: Observable<boolean>

  @Output()
  tabClicked: EventEmitter<KindType> = new EventEmitter()

  @Output()
  loadMore: EventEmitter<boolean> = new EventEmitter()

  get id(): string {
    return this.activatedRoute.snapshot.paramMap.get('id')
  }

  selectedTab: Tab | undefined

  private _tabs: Tab[] | undefined

  constructor(private readonly apiService: ApiService, private readonly activatedRoute: ActivatedRoute, private readonly router: Router) {
    super()
  }

  ngOnInit() {
    const isSet = (tab: Tab) => tab.count !== null

    this.subscriptions.push(
      this.actionType$
        .pipe(
          map(type => <[LayoutPages, Tab]>[type, { ...this.selectedTab }]),
          switchMap(([type, selectedTab]) => this.updateTabsCounts$(type).pipe(filter(succeeded => succeeded && !isSet(selectedTab))))
        )
        .subscribe(() => {
          this.setInitTabSelection()
        }),
      this.activatedRoute.queryParamMap
        .pipe(
          filter(
            queryParam =>
              queryParam.has('tab') && isSet(this.selectedTab) /* the case on page start is handled in markTabAsSelected method */
          )
        )
        .subscribe(queryParam => {
          const selectedTab = this.tabs.find(compareTabWith(queryParam.get('tab')))
          this.selectTab(selectedTab)
        })
    )
  }

  // on page start (after first api request)
  setInitTabSelection() {
    const hasData = (tab: Tab) => tab.count > 0
    const tabNameFromQuery = this.activatedRoute.snapshot.queryParamMap.get('tab')
    const tabFromQuery = this.tabs.filter(hasData).find(compareTabWith(tabNameFromQuery))
    const firstTabWithData = this.tabs.find(hasData)
    const selectedTab = tabFromQuery || firstTabWithData

    if (selectedTab !== this.selectedTab) {
      this.selectTab(selectedTab)
    }
  }

  onSelectTab(selectedTab: Tab) {
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { tab: selectedTab.title } })
  }

  onLoadMore() {
    this.loadMore.emit(true)
  }

  private updateTabsCounts$ = (type: LayoutPages): Observable<boolean> => {
    const resetTabsCount = () => this.tabs.forEach(tab => (tab.count = 0))
    const aggregateFunction = (info: OperationCount, field: string) => {
      const isTabKindEqualTo = (kind: string) => (tab: Tab): boolean =>
        Array.isArray(tab.kind) ? tab.kind.indexOf(kind) !== -1 : tab.kind === kind
      const tab = info.kind === 'proposals' ? this.tabs.find(isTabKindEqualTo('ballot')) : this.tabs.find(isTabKindEqualTo(info.kind))

      if (tab) {
        const count = parseInt(info[`count_${field}`], 10)
        tab.count = tab.count ? tab.count + count : count
      }
    }

    if (type === LayoutPages.Transaction) {
      return this.apiService.getOperationCount('operation_group_hash', this.id).pipe(
        map(transactionCounts => {
          resetTabsCount()
          transactionCounts.forEach(info => aggregateFunction(info, 'operation_group_hash'))

          return true
        }),
        catchError(() => of(false))
      )
    }

    if (type === LayoutPages.Account) {
      const from$ = this.apiService.getOperationCount('source', this.id)
      const to$ = this.apiService.getOperationCount('destination', this.id)
      const delegate$ = this.apiService
        .getOperationCount('delegate', this.id)
        .pipe(map(counts => counts.map(count => (count.kind === 'origination' ? { ...count, kind: 'delegation' } : count))))

      return forkJoin(from$, to$, delegate$).pipe(
        map(([from, to, delegate]) => {
          resetTabsCount()
          from.forEach(info => aggregateFunction(info, 'source'))
          to.forEach(info => aggregateFunction(info, 'destination'))
          delegate.forEach(info => aggregateFunction(info, 'delegate'))

          return true
        }),
        catchError(() => of(false))
      )
    }

    // type === LayoutPages.Block
    return this.apiService.getOperationCount('block_level', this.id).pipe(
      map(blockCounts => {
        resetTabsCount()
        blockCounts.forEach(info => aggregateFunction(info, 'block_level'))

        return true
      }),
      catchError(() => of(false))
    )
  }

  private selectTab(selectedTab: Tab) {
    if (selectedTab.title === this.selectedTab.title) {
      return
    }

    this.updateSelectedTab(selectedTab)
    this.tabClicked.emit(selectedTab.kind)
  }

  private updateSelectedTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = tab === selectedTab))
    this.selectedTab = selectedTab
  }
}
