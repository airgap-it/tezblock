import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiService } from 'src/app/services/api/api.service'

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

  constructor(private readonly apiService: ApiService, private readonly route: ActivatedRoute) {}

  public getTabCount(tabs: Tab[]) {
    const ownId: string = this.route.snapshot.params.id

    const aggregateFunction = (info, field) => {
      let tab = tabs.find(tabArgument => tabArgument.kind === info.kind)
      if (info.kind === 'proposals') {
        tab = tabs.find(tabArgument => tabArgument.kind === 'ballot')
      }
      if (tab) {
        const count = parseInt(info[`count_${field}`], 10)
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
          transactionCounts.forEach(info => aggregateFunction(info, 'operation_group_hash'))

          setFirstActiveTab()
        })
        .catch(console.error)
    } else if (this.page === 'account') {
      const fromPromise = this.apiService.getOperationCount('source', ownId).toPromise()
      const toPromise = this.apiService.getOperationCount('destination', ownId).toPromise()
      const delegatePromise = this.apiService
        .getOperationCount('delegate', ownId)
        .pipe(
          map(counts => {
            counts.forEach(count => {
              if (count.kind === 'origination') {
                count.kind = 'delegation'
              }
            })

            return counts
          })
        )
        .toPromise()

      Promise.all([fromPromise, toPromise, delegatePromise])
        .then(([from, to, delegate]) => {
          from.forEach(info => aggregateFunction(info, 'source'))
          to.forEach(info => aggregateFunction(info, 'destination'))
          delegate.forEach(info => aggregateFunction(info, 'delegate'))

          setFirstActiveTab()
        })
        .catch(console.error)
    } else {
      const blockPromise = this.apiService.getOperationCount('block_level', ownId).toPromise()

      blockPromise
        .then(blockCounts => {
          blockCounts.forEach(info => aggregateFunction(info, 'block_level'))

          setFirstActiveTab()
        })
        .catch(console.error)
    }
  }

  public selectTab(selectedTab: Tab) {
    const currentlySelectedTab = this.tabs.find(tab => tab.active)
    // Don't change the tab if it's already selected
    if (currentlySelectedTab && currentlySelectedTab.title === selectedTab.title) {
      return
    }
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
}
