import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { BlockStatus } from '@tezblock/services/health/health.service'

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent implements OnInit {

  latestNodeBlock$: Observable<any>
  latestConseilBlock$: Observable<BlockStatus>

  constructor(private readonly store$: Store<fromRoot.State>) {
    this.store$.dispatch(actions.loadLatestNodeBlock())
    this.store$.dispatch(actions.loadLatestConseilBlock())
  }

  ngOnInit() {
    this.latestNodeBlock$ = this.store$.select(state => state.health.latestNodeBlock)
    this.latestConseilBlock$ = this.store$.select(state => state.health.latestConseilBlock)
  }

}
