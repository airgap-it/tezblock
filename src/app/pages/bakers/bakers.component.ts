import { Component, OnInit } from '@angular/core'
import { Observable, of } from 'rxjs'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import { BaseComponent } from '@tezblock/components/base.component'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { columns } from './table-definitions'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { getRefresh } from '@tezblock/domain/synchronization'

@Component({
  selector: 'app-bakers',
  templateUrl: './bakers.component.html',
  styleUrls: ['./bakers.component.scss']
})
export class BakersComponent extends BaseComponent implements OnInit {
  columns: Column[]
  loading$: Observable<boolean>
  data$: Observable<Object>
  showLoadMore$: Observable<boolean>
  totalActiveBakers$: Observable<number>

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
  }

  ngOnInit() {
    this.data$ = this.store$.select(state => state.bakers.activeBakers.data)
    this.loading$ = this.store$.select(state => state.bakers.activeBakers.loading)
    this.showLoadMore$ = of(true)
    this.totalActiveBakers$ = this.store$.select(state => state.bakers.activeBakers.pagination.total)

    this.subscriptions.push(
      getRefresh([
        this.actions$.pipe(ofType(actions.loadActiveBakersFailed)),
        this.actions$.pipe(ofType(actions.loadActiveBakersSucceeded))
      ]).subscribe(() => {
        this.store$.dispatch(actions.loadActiveBakers())
        this.store$.dispatch(actions.loadTotalActiveBakers())
      })
    )

    this.columns = columns
  }

  loadMore() {
    this.store$.dispatch(actions.increasePageOfActiveBakers())
  }
}
