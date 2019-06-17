import { Component, EventEmitter, Input, Output } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { ApiService } from 'src/app/services/api/api.service'
import { IconService, IconRef } from 'src/app/services/icon/icon.service'

export interface Tab {
  title: string
  active: boolean
  count: number
  kind: string
  icon?: string[]
}

@Component({
  selector: 'tabbed-table',
  templateUrl: './tabbed-table.component.html',
  styleUrls: ['./tabbed-table.component.scss']
})
export class TabbedTableComponent {
  @Input()
  public page: string = 'account'

  private _tabs: Tab[] | undefined = []
  public selectedTab: Tab | undefined = undefined

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
  public dataService?: any // TODO: <any>

  @Input()
  public data?: Observable<any> // TODO: <any>

  @Input()
  public loading?: Observable<boolean>

  @Output()
  public readonly tabClicked: EventEmitter<string> = new EventEmitter()

  constructor(private readonly apiService: ApiService, private readonly router: Router, private iconService: IconService) {}

  public getTabCount(tabs: Tab[]) {
    let ownId: string = this.router.url
    const split = ownId.split('/')
    ownId = split.slice(-1).pop()

    const aggregateFunction = info => {
      const tab = tabs.find(tabArgument => tabArgument.kind === info.kind)
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
    } else if (this.page === 'account') {
      const fromPromise = this.apiService.getOperationCount('source', ownId).toPromise()
      const toPromise = this.apiService.getOperationCount('destination', ownId).toPromise()
      // const delegatePromise = this.apiService.getOperationCount('delegate', ownId).toPromise()

      Promise.all([fromPromise, toPromise /*, delegatePromise */])
        .then(([from, to /*, delegate */]) => {
          from.forEach(aggregateFunction)
          to.forEach(aggregateFunction)
          // delegate.forEach(aggregateFunction)

          setFirstActiveTab()
        })
        .catch(console.error)
    } else {
      const blockPromise = this.apiService.getOperationCount('block_level', ownId).toPromise()

      blockPromise
        .then(blockCounts => {
          blockCounts.forEach(aggregateFunction)

          setFirstActiveTab()
        })
        .catch(console.error)
    }
  }

  public selectTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = false))
    selectedTab.active = true
    this.selectedTab = selectedTab

    this.tabClicked.emit(selectedTab.kind)
  }

  public loadMore() {
    if (this.dataService && this.dataService.loadMore) {
      this.dataService.loadMore()
    }
  }

  public icon(name: IconRef): string[] {
    return this.iconService.iconProperties(name)
  }
}
