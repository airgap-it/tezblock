import { Component, OnInit } from '@angular/core'
import { Observable, of, from } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'
import { ChartOptions, ChartSize, ChartTooltipItem, ChartData } from 'chart.js'
import 'chartjs-plugin-piechart-outlabels'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'

import { BaseComponent } from '@tezblock/components/base.component'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { columns } from './table-definitions'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { othersBakersLabel } from './reducer'
import { getRefresh } from '@tezblock/domain/synchronization'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { Baker } from '@tezblock/services/api/api.service'
import { OrderBy } from '@tezblock/services/base.service'
import { Title, Meta } from '@angular/platform-browser'

const labelsParams = {
  display: true,
  stretch: 45,
  valuePrecision: 1,
  percentPrecision: 2,
  font: {
    resizable: true,
    minSize: 8,
    maxSize: 11
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
  '#e91e63',
  '#d81b60',
  '#c2185b',
  '#ad1457',
  '#880e4f',
  '#2e5bff'
]

@Component({
  selector: 'app-baker-overview',
  templateUrl: './baker-overview.component.html',
  styleUrls: ['./baker-overview.component.scss']
})
export class BakerOverviewComponent extends BaseComponent implements OnInit {
  columns: Column[]
  loading$: Observable<boolean>
  data$: Observable<Object>
  showLoadMore$: Observable<boolean>
  totalActiveBakers$: Observable<number>
  top24ChartDatasets$: Observable<{ data: number[]; label: string }[]>
  top24ChartLabels$: Observable<string[]>
  top24ChartOptions$: Observable<ChartOptions>
  top24ChartColors: any[] = [{ backgroundColor: palette }]
  top24ChartSize$: Observable<ChartSize>
  isMobile$: Observable<boolean>
  orderBy$: Observable<OrderBy>

  constructor(
    private readonly actions$: Actions,
    private readonly aliasPipe: AliasPipe,
    private readonly amountConverterPipe: AmountConverterPipe,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly store$: Store<fromRoot.State>,
    private titleService: Title,
    private metaTagService: Meta
  ) {
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
          data.map(dataItem =>
            dataItem.pkh !== othersBakersLabel ? this.aliasPipe.transform(dataItem.pkh) || dataItem.pkh : othersBakersLabel
          )
        ),
        map((labels: string[]) => labels.map(label => `${label} -`))
      )
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .pipe(map(breakpointState => breakpointState.matches))
    this.top24ChartOptions$ = this.isMobile$.pipe(map(this.getOptions.bind(this)))
    this.top24ChartSize$ = this.isMobile$.pipe(map(isMobile => (isMobile ? { width: 200, height: 200 } : { width: 800, height: 480 })))
    this.orderBy$ = this.store$.select(state => state.bakers.activeBakers.orderBy)

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

    this.titleService.setTitle(`Tezos Bakers - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `Top 25 Tezos bakers on tezblock with information about balance, number of votes, staking balance and number of delegators.">`
    })
  }

  loadMore() {
    this.store$.dispatch(actions.increasePageOfActiveBakers())
  }

  sortBy(orderBy: OrderBy) {
    this.store$.dispatch(actions.sortActiveBakersByKind({ orderBy }))
  }

  private getOptions(isMobile: boolean): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile
          ? 0
          : {
              top: 80,
              right: 130,
              bottom: 190,
              left: 130
            }
      },
      plugins: {
        outlabels: isMobile ? { display: false } : labelsParams
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
            const bakerName = (<string>data.labels[tooltipItem.index]).replace('-', ':')
            const stakingBalance = <number>data.datasets[0].data[tooltipItem.index]
            const stakingBalanceLabel = this.amountConverterPipe.transform(stakingBalance, {
              protocolIdentifier: 'xtz',
              maxDigits: 6
            })

            return `${bakerName} ${stakingBalanceLabel} ꜩ`
          }
        }
      }
    }
  }
}
