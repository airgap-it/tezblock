import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { BlockStatus } from '@tezblock/services/health/health.service'
import { map } from 'rxjs/operators'
import * as moment from 'moment'
import { Title } from '@angular/platform-browser'

const isOlderThan4Mins = (time: moment.Moment): boolean => {
  const fourMinutesOld = moment().add(-4, 'minutes')

  return time.isBefore(fourMinutesOld)
}

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent implements OnInit {
  latestNodeBlock$: Observable<any>
  isNodeUp$: Observable<boolean>
  latestConseilBlock$: Observable<BlockStatus>
  isConseilUp$: Observable<boolean>

  constructor(private readonly store$: Store<fromRoot.State>, private titleService: Title) {
    this.store$.dispatch(actions.loadLatestNodeBlock())
    this.store$.dispatch(actions.loadLatestConseilBlock())
  }

  ngOnInit() {
    this.latestNodeBlock$ = this.store$.select(state => state.health.latestNodeBlock)
    this.isNodeUp$ = this.latestNodeBlock$.pipe(
      map(latestNodeBlock => latestNodeBlock && !isOlderThan4Mins(moment(latestNodeBlock.header.timestamp, 'YYYY-MM-DD')))
    )
    this.latestConseilBlock$ = this.store$.select(state => state.health.latestConseilBlock)
    this.isConseilUp$ = this.latestConseilBlock$.pipe(
      map(latestConseilBlock => latestConseilBlock && !isOlderThan4Mins(moment(latestConseilBlock.timestamp, 'YYYY-MM-DD')))
    )
    this.titleService.setTitle('Health - tezblock')
  }
}
