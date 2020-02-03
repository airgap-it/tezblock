import { Component, OnInit } from '@angular/core'
import { Observable, of, from } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'
import { ChartOptions, ChartSize } from 'chart.js'
import 'chartjs-plugin-piechart-outlabels'

import { BaseComponent } from '@tezblock/components/base.component'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { columns } from './table-definitions'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { othersBakersLabel } from './reducer'
import { getRefresh } from '@tezblock/domain/synchronization'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { Baker } from '@tezblock/services/api/api.service'

const labelsParams = {
  display: true,
  stretch: 45,
  valuePrecision: 1,
  percentPrecision: 2,
  font: {
    resizable: true,
    minSize: 8,
    maxSize: 12
  }
}

const palette = [
  '#311b92',
  '#4527a0',
  '#512da8',
  '#5e35b1',
  '#673ab7',
  '#7e57c2',
  '#4a148c',
  '#6a1b9a',
  '#7b1fa2',
  '#8e24aa',
  '#9c27b0',
  '#ab47bc',
  '#1a237e',
  '#283593',
  '#303f9f',
  '#3949ab',
  '#3f51b5',
  '#5c6bc0',
  '#0d47a1',
  // plus some 6 random ones ...
  '#e91e63',
  '#d81b60',
  '#c2185b',
  '#ad1457',
  '#880e4f',
  '#2e5bff'
]

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
  top24ChartDatasets$: Observable<{ data: number[]; label: string }[]>
  top24ChartLabels$: Observable<string[]>
  top24ChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 130,
        right: 150,
        bottom: 170,
        left: 150
      }
    },
    plugins: {
      outlabels: labelsParams
    }
  }
  top24ChartColors: any[] = [{ backgroundColor: palette }]
  top24ChartSize: ChartSize = { width: 800, height: 600 }

  constructor(private readonly actions$: Actions, private readonly aliasPipe: AliasPipe, private readonly store$: Store<fromRoot.State>) {
    super()
  }

  ngOnInit() {
    this.data$ = this.store$.select(state => state.bakers.activeBakers.data)
    this.loading$ = this.store$.select(state => state.bakers.activeBakers.loading)
    this.showLoadMore$ = of(true)
    this.totalActiveBakers$ = this.store$.select(state => state.bakers.activeBakers.pagination.total)
    this.top24ChartDatasets$ = this.store$
      .select(state => state.bakers.top24Bakers)
      .pipe(
        filter(Array.isArray),
        map(data => [
          {
            data: data.map(dataItem => dataItem.staking_balance),
            label: 'Staking Balance'
          }
        ])
      )
    this.top24ChartLabels$ = this.store$
      .select(state => state.bakers.top24Bakers)
      .pipe(
        filter(Array.isArray),
        map((data: Baker[]) =>
          data.map(dataItem => (dataItem.pkh !== othersBakersLabel ? this.aliasPipe.transform(dataItem.pkh) : othersBakersLabel))
        ),
        map((labels: string[]) => labels.map(label => `${label} -`))
      )

    this.subscriptions.push(
      getRefresh([
        this.actions$.pipe(ofType(actions.loadActiveBakersFailed)),
        this.actions$.pipe(ofType(actions.loadActiveBakersSucceeded))
      ]).subscribe(() => {
        this.store$.dispatch(actions.loadActiveBakers())
        this.store$.dispatch(actions.loadTotalActiveBakers())
        this.store$.dispatch(actions.loadTop24Bakers())
      })
    )

    this.columns = columns
  }

  loadMore() {
    this.store$.dispatch(actions.increasePageOfActiveBakers())
  }
}
