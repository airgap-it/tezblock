import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Component, OnInit } from '@angular/core'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { BaseComponent } from '@tezblock/components/base.component'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { AmountConverterPipe } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import * as fromRoot from '@tezblock/reducers'
import { OrderBy } from '@tezblock/services/base.service'
import { ChartOptions, ChartSize, ChartTooltipItem, ChartData } from 'chart.js'
import { Observable, of } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import * as actions from './actions'
import { columns } from './table-definitions'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'

const labelsParams = {
  display: true,
  stretch: 45,
  text: '%l %v ꜩ',
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
  selector: 'app-account-overview',
  templateUrl: './account-overview.component.html',
  styleUrls: ['./account-overview.component.scss']
})
export class AccountOverviewComponent extends BaseComponent implements OnInit {
  public columns: Column[]
  public loading$: Observable<boolean>
  public data$: Observable<Object>
  public showLoadMore$: Observable<boolean>
  public top25ChartDatasets$: Observable<{ data: number[]; label: string }[]>
  public top25ChartLabels$: Observable<string[]>
  public top25ChartOptions$: Observable<ChartOptions>
  public top25ChartColors: any[] = [{ backgroundColor: palette }]
  public top25ChartSize$: Observable<ChartSize>
  public isMobile$: Observable<boolean>
  public orderBy$: Observable<OrderBy>

  constructor(
    private readonly actions$: Actions,
    private readonly aliasPipe: AliasPipe,
    private readonly amountConverterPipe: AmountConverterPipe,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly store$: Store<fromRoot.State>,
    private readonly shortenStringPipe: ShortenStringPipe
  ) {
    super()
  }

  public ngOnInit() {
    const loadingAccounts$ = this.store$.select(state => state.accountsList.accounts.loading)
    const accountsData$ = this.store$.select(state => state.accountsList.accounts.data)
    const accountsOrderBy$ = this.store$.select(state => state.accountsList.accounts.orderBy)

    this.store$.dispatch(actions.loadAccounts())
    this.store$.dispatch(actions.loadTop25Accounts())

    this.setupTable(columns, accountsData$, loadingAccounts$, accountsOrderBy$)

    this.top25ChartDatasets$ = this.store$
      .select(state => state.accountsList.top25Accounts)
      .pipe(
        filter(Array.isArray),
        map(data => [
          {
            data: data.map(dataItem => {
              return Math.round(dataItem.balance / 1000)
            }),
            label: 'Balance'
          }
        ])
      )
    this.top25ChartLabels$ = this.store$
      .select(state => state.accountsList.top25Accounts)
      .pipe(
        filter(Array.isArray),
        map(data =>
          data.map(dataItem => {
            return this.getFormattedAddress(dataItem.account_id)
          })
        ),
        map((labels: string[]) => labels.map(label => `${label} -`))
      )

    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .pipe(map(breakpointState => breakpointState.matches))
    this.top25ChartOptions$ = this.isMobile$.pipe(map(this.getOptions.bind(this)))
    this.top25ChartSize$ = this.isMobile$.pipe(map(isMobile => (isMobile ? { width: 200, height: 200 } : { width: 800, height: 500 })))
  }
  public loadMore() {
    this.store$.dispatch(actions.increasePageOfAccounts())
  }

  public sortBy(orderBy: OrderBy) {
    this.store$.dispatch(actions.sortAccounts({ orderBy }))
  }

  private setupTable(
    columns: Column[],
    data$: Observable<Object>,
    loading$: Observable<boolean>,
    orderBy$: Observable<OrderBy>,
    showLoadMore$?: Observable<boolean>
  ) {
    this.columns = columns
    this.data$ = data$
    this.loading$ = loading$
    this.orderBy$ = orderBy$
    this.showLoadMore$ = showLoadMore$ || of(true)
  }

  private getOptions(isMobile: boolean): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile
          ? 0
          : {
              top: 120,
              right: 130,
              bottom: 130,
              left: 130
            }
      },
      plugins: {
        outlabels: isMobile ? { display: false } : labelsParams
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
            const accountName = (<string>data.labels[tooltipItem.index]).replace(' -', ':')
            const balance = <number>data.datasets[0].data[tooltipItem.index] * 1000
            const balanceLabel = this.amountConverterPipe.transform(balance, {
              protocolIdentifier: 'xtz',
              maxDigits: 6,
              fontSmall: true,
              fontColor: true
            })

            return `${accountName} ${balanceLabel} ꜩ`
          }
        }
      }
    }
  }
  private getFormattedAddress(address: string) {
    const getAliasOrShorten = () => this.aliasPipe.transform(address) || this.shortenStringPipe.transform(address)

    return getAliasOrShorten()
  }
}
