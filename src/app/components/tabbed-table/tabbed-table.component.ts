import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { filter } from 'rxjs/operators'

import { BaseComponent } from '@tezblock/components/base.component'
import { DownloadService } from '@tezblock/services/download/download.service'
import { Tab, compareTabWith, KindType } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'

@Component({
  selector: 'tabbed-table',
  templateUrl: './tabbed-table.component.html',
  styleUrls: ['./tabbed-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabbedTableComponent extends BaseComponent implements OnInit {
  @Input()
  page: string = 'account'

  @Input()
  set tabs(value: Tab[]) {
    if (value !== null && value !== this._tabs) {
      const selectedTab = value.find(tab => tab.active)

      this._tabs = value

      this.updateSelectedTab(selectedTab)

      if (this._tabs.some(tab => tab.count > 0)) {
        this.setInitTabSelection()
      }
    }
  }

  get tabs() {
    return this._tabs || []
  }

  @Input()
  data: any[]

  @Input()
  loading: boolean

  @Input()
  orderBy: OrderBy

  @Input()
  downloadable: boolean

  @Input()
  allEnabled: boolean

  @Output()
  tabClicked: EventEmitter<KindType> = new EventEmitter()

  @Output()
  loadMore: EventEmitter<boolean> = new EventEmitter()

  @Output() onSort: EventEmitter<OrderBy> = new EventEmitter()

  get id(): string {
    return this.activatedRoute.snapshot.paramMap.get('id')
  }

  selectedTab: Tab | undefined

  private _tabs: Tab[] | undefined
  public enableDownload: boolean = false

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly downloadService: DownloadService
  ) {
    super()
  }

  ngOnInit() {
    const isSet = (tab: Tab) => tab && this.tabs.find(_tab => _tab.title === tab.title).count !== null

    this.subscriptions.push(
      this.activatedRoute.queryParamMap
        .pipe(
          filter(
            queryParam =>
              queryParam.has('tab') && isSet(this.selectedTab) /* the case on page start is handled in setInitTabSelection method */
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

    if (selectedTab && (!this.selectedTab || selectedTab.title !== this.selectedTab.title)) {
      this.selectTab(selectedTab)
    }
  }

  onSelectTab(selectedTab: Tab) {
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { tab: selectedTab.title } })
  }

  onLoadMore() {
    this.loadMore.emit(true)
  }

  trackByFn(index: number, item: Tab): string {
    return item ? item.title : null
  }

  download() {
    if (this.downloadable) {
      this.downloadService.download(this.page, this.selectedTab.count, this.selectedTab.kind)
    }
  }

  sortTransactions(orderBy: OrderBy) {
    this.onSort.emit(orderBy)
  }

  private selectTab(selectedTab: Tab) {
    if (this.selectedTab && selectedTab.title === this.selectedTab.title) {
      return
    }

    this.updateSelectedTab(selectedTab)
    this.tabClicked.emit(selectedTab.kind)
  }

  private updateSelectedTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = tab === selectedTab))
    this.selectedTab = selectedTab
    this.enableDownload = selectedTab.kind === 'transaction' || selectedTab.kind === 'delegation' || selectedTab.kind === 'origination'
  }
}
