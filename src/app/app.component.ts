import { Component } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import * as actions from './app.actions'
import * as fromRoot from '@tezblock/reducers'
import { getRefresh } from '@tezblock/domain/synchronization'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private readonly actions$: Actions, readonly router: Router, private readonly store$: Store<fromRoot.State>) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.store$.dispatch(actions.saveLatestRoute({ navigation: <NavigationEnd>e })))

    getRefresh([
      this.actions$.pipe(ofType(actions.loadLatestBlockSucceeded)),
      this.actions$.pipe(ofType(actions.loadLatestBlockFailed))
    ]).subscribe(() => this.store$.dispatch(actions.loadLatestBlock()))

    this.store$.dispatch(actions.loadPeriodInfos())
  }

  navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }
}
