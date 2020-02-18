import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, of, pipe } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'
import { range, negate, isNil } from 'lodash'
import * as moment from 'moment'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { ChartOptions, ChartTooltipItem, ChartData } from 'chart.js'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseComponent } from '@tezblock/components/base.component'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { toArray, groupBy } from '@tezblock/services/fp'
import { columns } from './table-definitions'
import { OperationTypes } from '@tezblock/domain/operations'
import { getRefresh } from '@tezblock/domain/synchronization'
import { defaultOptions } from '@tezblock/components/chart-item/chart-item.component'
import { toXTZ, tryGetProtocolByIdentifier } from '@tezblock/pipes/amount-converter/amount-converter.pipe'

const noOfDays = 7
const thousandSeparator = /\B(?=(\d{3})+(?!\d))/g
const protocol = tryGetProtocolByIdentifier('xtz')

const timestampsToCountsPerDay = (timestamps: number[]): number[] => {
  const diffsInDays = timestamps.map(timestamp => moment().diff(moment(timestamp), 'days'))

  return range(0, noOfDays).map(index => diffsInDays.filter(diffsInDay => diffsInDay === index).length)
}

const toAmountPerDay = (data: actions.TransactionChartItem[]): number[] => {
  const toDiffsInDays = (data: actions.TransactionChartItem[]): { diffInDays: number; amount: number }[] =>
    data.map(item => ({
      diffInDays: moment().diff(moment(item.timestamp), 'days'),
      amount: item.amount
    }))
  const sum = (data: { [key: string]: { diffInDays: number; amount: number }[] }): number[] =>
    range(0, noOfDays).map(index => {
      const match = data[index]

      return match ? match.map(item => item.amount).reduce((a, b) => a + b) : 0
    })
  const amountToXTZ = (data: number[]): number[] => data.map(item => toXTZ(item, protocol) / 1000)

  return pipe(
    toDiffsInDays,
    groupBy('diffInDays'),
    sum,
    amountToXTZ
  )(data)
}

export const toTransactionsChartDataSource = (countLabel: string, amountLabel: string) => (
  data: actions.TransactionChartItem[]
): { data: number[]; label: string }[] => [
  { data: timestampsToCountsPerDay(data.map(item => item.timestamp)), label: countLabel },
  { data: toAmountPerDay(data), label: amountLabel }
]
const timestampsToChartDataSource = (label: string) => (timestamps: number[]): { data: number[]; label: string } => ({
  data: timestampsToCountsPerDay(timestamps),
  label: label
})

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  columns: Column[]
  loading$: Observable<boolean>
  data$: Observable<Object>
  showLoadMore$: Observable<boolean>
  activationsCountLast24h$: Observable<number>
  activationsChartDatasets$: Observable<{ data: number[]; label: string }[]>
  originationsCountLast24h$: Observable<number>
  originationsChartDatasets$: Observable<{ data: number[]; label: string }[]>
  transactionsCountLast24h$: Observable<number>
  transactionsChartDatasets$: Observable<{ data: number[]; label: string }[]>
  transactionsChartOptions: ChartOptions
  transactionsTotalXTZ$: Observable<number>

  routeName$: Observable<string>

  readonly chartLabels: string[] = range(0, noOfDays).map(index =>
    moment()
      .add(-index, 'days')
      .format('DD.MM.YYYY')
  )

  private dataService

  private get routeName(): string {
    return this.route.snapshot.paramMap.get('route')
  }

  private get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly route: ActivatedRoute,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.routeName$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('route')))

    this.routeName$.subscribe(routeName => {
      try {
        switch (routeName) {
          case 'block':
            // this.dataService = new BlockService(this.apiService)
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Block]({ showFiatValue: this.isMainnet }))
            const blockLoading$ = this.store$.select(state => state.list.blocks.loading)
            const blockData$ = this.store$.select(state => state.list.blocks.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadBlocksFailed)),
                this.actions$.pipe(ofType(actions.loadBlocksSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadBlocks()))
            )
            this.setupTable(columns[OperationTypes.Block]({ showFiatValue: this.isMainnet }), blockData$, blockLoading$)

            break
          case 'transaction':
            this.transactionsChartOptions = {
              ...defaultOptions,
              tooltips: {
                callbacks: {
                  label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
                    const label: string = data.datasets[tooltipItem.datasetIndex].label
                    const value = parseInt(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toString())
                      .toString()
                      .replace(thousandSeparator, ',')
                    const valueLabel = tooltipItem.datasetIndex === 0 ? value : `${value}K ꜩ`

                    return `${label}: ${valueLabel}`
                  }
                }
              }
            }
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadTransactionsCountLast24hSucceeded)),
                this.actions$.pipe(ofType(actions.loadTransactionsCountLast24hFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadTransactionsCountLast24h())),
              getRefresh([
                this.actions$.pipe(ofType(actions.loadTransactionsChartDataSucceeded)),
                this.actions$.pipe(ofType(actions.loadTransactionsChartDataFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadTransactionsChartData()))
            )
            this.transactionsCountLast24h$ = this.store$.select(state => state.list.transactionsCountLast24h)
            this.transactionsChartDatasets$ =
              //this.store$.select(state => state.list.transactionsChartDatasets)
              this.store$
                .select(state => state.list.transactionsChartData)
                .pipe(
                  filter(Array.isArray),
                  map(toTransactionsChartDataSource('Transactions', 'Total XTZ'))
                )
            this.transactionsTotalXTZ$ = this.store$
              .select(state => state.list.transactionsChartData)
              .pipe(
                filter(negate(isNil)),
                map(transactionsChartData => transactionsChartData.map(item => item.amount).reduce((a, b) => a + b))
              )
            // this.dataService = new TransactionService(this.apiService)
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Transaction]({ showFiatValue: this.isMainnet }))

            const transactionLoading$ = this.store$.select(state => state.list.transactions.loading)
            const transactionData$ = this.store$.select(state => state.list.transactions.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadTransactionsFailed)),
                this.actions$.pipe(ofType(actions.loadTransactionsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadTransactions()))
            )
            this.setupTable(columns[OperationTypes.Transaction]({ showFiatValue: this.isMainnet }), transactionData$, transactionLoading$)
            break
          case 'activation':
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadActivationsCountLast24hSucceeded)),
                this.actions$.pipe(ofType(actions.loadActivationsCountLast24hFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadActivationsCountLast24h())),
              getRefresh([
                this.actions$.pipe(ofType(actions.loadActivationsCountLastXdSucceeded)),
                this.actions$.pipe(ofType(actions.loadActivationsCountLastXdFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadActivationsCountLastXd()))
            )
            this.activationsCountLast24h$ = this.store$.select(state => state.list.activationsCountLast24h)
            this.activationsChartDatasets$ = this.store$
              .select(state => state.list.activationsCountLastXd)
              .pipe(
                filter(Array.isArray),
                map(timestampsToChartDataSource('Activations')),
                map(toArray)
              )
            // this.dataService = new TransactionService(this.apiService)
            // this.dataService.updateKind(['activate_account'])
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Activation]({ showFiatValue: this.isMainnet }))
            const activationsLoading$ = this.store$.select(state => state.list.activations.loading)
            const activationsData$ = this.store$.select(state => state.list.activations.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadActivationsFailed)),
                this.actions$.pipe(ofType(actions.loadActivationsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadActivations()))
            )
            this.setupTable(columns[OperationTypes.Activation]({ showFiatValue: this.isMainnet }), activationsData$, activationsLoading$)
            break
          case 'origination':
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadOriginationsCountLast24hSucceeded)),
                this.actions$.pipe(ofType(actions.loadOriginationsCountLast24hFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadOriginationsCountLast24h())),
              getRefresh([
                this.actions$.pipe(ofType(actions.loadOriginationsCountLastXdSucceeded)),
                this.actions$.pipe(ofType(actions.loadOriginationsCountLastXdFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadOriginationsCountLastXd()))
            )
            this.originationsCountLast24h$ = this.store$.select(state => state.list.originationsCountLast24h)
            this.originationsChartDatasets$ = this.store$
              .select(state => state.list.originationsCountLastXd)
              .pipe(
                filter(Array.isArray),
                map(timestampsToChartDataSource('Originations')),
                map(toArray)
              )
            // this.dataService = new TransactionService(this.apiService)
            // this.dataService.updateKind(['origination'])
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Origination]({ showFiatValue: this.isMainnet }))
            const originationsLoading$ = this.store$.select(state => state.list.originations.loading)
            const originationsData$ = this.store$.select(state => state.list.originations.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadOriginationsFailed)),
                this.actions$.pipe(ofType(actions.loadOriginationsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadOriginations()))
            )
            this.setupTable(columns[OperationTypes.Origination]({ showFiatValue: this.isMainnet }), originationsData$, originationsLoading$)
            break
          case 'delegation':
            // this.dataService = new TransactionService(this.apiService)
            // this.dataService.updateKind(['delegation'])
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Delegation]({ showFiatValue: this.isMainnet }))
            const delegationsLoading$ = this.store$.select(state => state.list.delegations.loading)
            const delegationsData$ = this.store$.select(state => state.list.delegations.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDelegationsFailed)),
                this.actions$.pipe(ofType(actions.loadDelegationsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDelegations()))
            )
            this.setupTable(columns[OperationTypes.Delegation]({ showFiatValue: this.isMainnet }), delegationsData$, delegationsLoading$)
            break
          case 'endorsement':
            // this.dataService = new TransactionService(this.apiService)
            // this.dataService.updateKind(['endorsement'])
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Endorsement]({ showFiatValue: this.isMainnet }))
            const endorsementsLoading$ = this.store$.select(state => state.list.endorsements.loading)
            const endorsementsData$ = this.store$.select(state => state.list.endorsements.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadEndorsementsFailed)),
                this.actions$.pipe(ofType(actions.loadEndorsementsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadEndorsements()))
            )
            this.setupTable(columns[OperationTypes.Endorsement]({ showFiatValue: this.isMainnet }), endorsementsData$, endorsementsLoading$)
            break
          case 'vote':
            // this.dataService = new TransactionService(this.apiService)
            // this.dataService.updateKind(['ballot', 'proposals'])
            // this.dataService.setPageSize(10)
            // this.setupTable(columns[OperationTypes.Ballot]({ showFiatValue: this.isMainnet }))

            const votesLoading$ = this.store$.select(state => state.list.votes.loading)
            const votesData$ = this.store$.select(state => state.list.votes.data)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadVotesFailed)),
                this.actions$.pipe(ofType(actions.loadVotesSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadVotes()))
            )
            this.setupTable(columns[OperationTypes.Ballot]({ showFiatValue: this.isMainnet }), votesData$, votesLoading$)
            break
          case 'double-baking':
            const dbLoading$ = this.store$.select(state => state.list.doubleBakings.loading)
            const dbData$ = this.store$.select(state => state.list.doubleBakings.data)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDoubleBakingsFailed)),
                this.actions$.pipe(ofType(actions.loadDoubleBakingsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDoubleBakings()))
            )
            this.setupTable(columns[OperationTypes.DoubleBakingEvidenceOverview]({ showFiatValue: this.isMainnet }), dbData$, dbLoading$)
            break
          case 'double-endorsement':
            const deLoading$ = this.store$.select(state => state.list.doubleEndorsements.loading)
            const deData$ = this.store$.select(state => state.list.doubleEndorsements.data)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsFailed)),
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDoubleEndorsements()))
            )
            this.setupTable(
              columns[OperationTypes.DoubleEndorsementEvidenceOverview]({ showFiatValue: this.isMainnet }),
              deData$,
              deLoading$
            )
            break
          case 'bakers':
            const bakersLoading$ = this.store$.select(state => state.list.activeBakers.loading)
            const bakersData$ = this.store$.select(state => state.list.activeBakers.data)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsFailed)),
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDoubleEndorsements()))
            )
            this.setupTable(
              columns[OperationTypes.DoubleEndorsementEvidenceOverview]({ showFiatValue: this.isMainnet }),
              deData$,
              deLoading$
            )
            break
          case 'proposal':
            const showLoadMore$ = this.store$
              .select(state => state.list.proposals)
              .pipe(
                map(
                  proposals =>
                    Array.isArray(proposals.data) &&
                    proposals.pagination.currentPage * proposals.pagination.selectedSize === proposals.data.length
                )
              )
            const loading$ = this.store$.select(state => state.list.proposals.loading)
            const data$ = this.store$.select(state => state.list.proposals.data)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadProposalsSucceeded)),
                this.actions$.pipe(ofType(actions.loadProposalsFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadProposals()))
            )
            this.setupTable(columns[OperationTypes.ProposalOverview]({ showFiatValue: this.isMainnet }), data$, loading$, showLoadMore$)
            break
          case 'contract':
            const showLoadMoreContracts$ = this.store$
              .select(state => state.list.contracts)
              .pipe(map(contracts => contracts.data.length < contracts.pagination.total))
            const loadingContracts$ = this.store$.select(state => state.list.contracts.loading)
            const contractsData$ = this.store$.select(state => state.list.contracts.data)

            this.store$.dispatch(actions.loadContracts())

            this.setupTable(
              columns[OperationTypes.Contract]({ showFiatValue: this.isMainnet }),
              contractsData$,
              loadingContracts$,
              showLoadMoreContracts$
            )
            break
          default:
            throw new Error('unknown route')
        }
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn(error)
      }
    })
  }

  loadMore() {
    switch (this.routeName) {
      case 'double-baking':
        this.store$.dispatch(actions.increasePageOfDoubleBakings())
        break
      case 'double-endorsement':
        this.store$.dispatch(actions.increasePageOfDoubleEndorsements())
        break
      case 'proposal':
        this.store$.dispatch(actions.increasePageOfProposals())
        break
      case 'block':
        this.store$.dispatch(actions.increasePageOfBlocks())
        break
      case 'transaction':
        this.store$.dispatch(actions.increasePageOfTransactions())
        break
      case 'activation':
        this.store$.dispatch(actions.increasePageOfActivations())
        break
      case 'origination':
        this.store$.dispatch(actions.increasePageOfOriginations())
        break
      case 'endorsement':
        this.store$.dispatch(actions.increasePageOfEndorsements())
        break
      case 'delegation':
        this.store$.dispatch(actions.increasePageOfDelegations())
        break
      case 'vote':
        this.store$.dispatch(actions.increasePageOfVotes())
        break
      default:
        ;(this.dataService as any).loadMore()
    }
  }

  sortBy(data: any) {
    switch (this.routeName) {
      case 'double-baking':
        this.store$.dispatch(actions.sortDoubleBakingsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'double-endorsement':
        this.store$.dispatch(actions.sortDoubleEndorsementsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'bakers':
        this.store$.dispatch(actions.sortActiveBakersByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'proposal':
        this.store$.dispatch(actions.sortProposalsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'block':
        this.store$.dispatch(actions.sortBlocksByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'transaction':
        this.store$.dispatch(actions.sortTransactionsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'activation':
        this.store$.dispatch(actions.sortActivationsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'origination':
        this.store$.dispatch(actions.sortOriginationsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'delegation':
        this.store$.dispatch(actions.sortDelegationsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'endorsement':
        this.store$.dispatch(actions.sortEndorsementsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break
      case 'vote':
        this.store$.dispatch(actions.sortVotesByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
        break

      case 'contracts':
        this.store$.dispatch(actions.increasePageOfContracts())
        break
      default:
        ;(this.dataService as any).loadMore()
    }
  }

  private setupTable(columns: Column[], data$?: Observable<Object>, loading$?: Observable<boolean>, showLoadMore$?: Observable<boolean>) {
    this.columns = columns
    this.data$ = data$ || this.dataService.list$
    this.loading$ = loading$ || this.dataService.loading$
    this.showLoadMore$ = showLoadMore$ || of(true)
  }
}
