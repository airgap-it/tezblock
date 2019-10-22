import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs'

export interface Tab {
  title: string
  active: boolean
  kind: string
  icon?: string[]
}

@Component({
  selector: 'rewards-table',
  templateUrl: './rewards-table.component.html',
  styleUrls: ['./rewards-table.component.scss']
})
export class RewardsTableComponent {
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
  }

  get tabs() {
    if (this._tabs) {
      return this._tabs
    } else {
      return []
    }
  }

  @Input()
  public data?: Observable<any> // TODO: <any>

  @Input()
  public loading?: Observable<boolean>

  @Output()
  public readonly tabClicked: EventEmitter<string> = new EventEmitter()

  constructor() {}

  public selectTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = false))
    selectedTab.active = true
    this.selectedTab = selectedTab

    this.tabClicked.emit(selectedTab.kind)
  }
}
