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
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { toArray, groupBy } from '@tezblock/services/fp'
import { columns } from './table-definitions'
import { OperationTypes } from '@tezblock/domain/operations'
import { getRefresh } from '@tezblock/domain/synchronization'
import { defaultOptions } from '@tezblock/components/chart-item/chart-item.component'
import { toXTZ } from '@tezblock/pipes/amount-converter/amount-converter.pipe'
import { OrderBy } from '@tezblock/services/base.service'
import { Title, Meta } from '@angular/platform-browser'
import { getDecimalsForSymbol } from '@tezblock/domain/airgap/get-decimals-for-symbol'

const noOfDays = 7
const thousandSeparator = /\B(?=(\d{3})+(?!\d))/g

const timestampsToCountsPerDay = (timestamps: number[]): number[] => {
  const diffsInDays = timestamps.map(timestamp => moment().diff(moment(timestamp), 'days'))

  return range(0, noOfDays).map(index => diffsInDays.filter(diffsInDay => diffsInDay === index).length)
}

const toAmountPerDay = (data: actions.TransactionChartItem[], network: TezosNetwork): number[] => {
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
  const decimals = getDecimalsForSymbol('xtz', network)
  const amountToXTZ = (data: number[]): number[] => data.map(item => toXTZ(item, decimals) / 1000)

  return pipe(toDiffsInDays, groupBy('diffInDays'), sum, amountToXTZ)(data)
}

export const toTransactionsChartDataSource = (countLabel: string, amountLabel: string, network: TezosNetwork) => (
  data: actions.TransactionChartItem[]
): { data: number[]; label: string }[] => [
  { data: timestampsToCountsPerDay(data.map(item => item.timestamp)), label: countLabel },
  { data: toAmountPerDay(data, network), label: amountLabel }
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
  orderBy$: Observable<OrderBy>
  noDataLabel: string
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

  private get routeName(): string {
    return this.route.snapshot.paramMap.get('route')
  }

  private get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  constructor(
    private readonly actions$: Actions,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly route: ActivatedRoute,
    private readonly store$: Store<fromRoot.State>,
    private titleService: Title,
    private metaTagService: Meta
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.routeName$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('route')))
    this.route.paramMap.subscribe(paramMap => {
      this.titleService.setTitle(`Tezos ${paramMap.get('route').replace(/^\w/, c => c.toUpperCase())}s - tezblock`)
    })
    this.routeName$.subscribe(routeName => {
      try {
        switch (routeName) {
          case 'block':
            const blockLoading$ = this.store$.select(state => state.list.blocks.loading)
            const blockData$ = this.store$.select(state => state.list.blocks.data)
            const blockOrderBy$ = this.store$.select(state => state.list.blocks.orderBy)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadBlocksFailed)),
                this.actions$.pipe(ofType(actions.loadBlocksSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadBlocks()))
            )
            this.setupTable(columns[OperationTypes.Block]({ showFiatValue: this.isMainnet }), blockData$, blockLoading$, blockOrderBy$)
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Blocks on tezblock with information about bakers, timestamp, transaction volume, fees, number of transactions and fitness of each block.">`
            })

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
                .pipe(filter(Array.isArray), map(toTransactionsChartDataSource('Transactions', 'Volume', this.chainNetworkService.getNetwork())))
            this.transactionsTotalXTZ$ = this.store$
              .select(state => state.list.transactionsChartData)
              .pipe(
                filter(negate(isNil)),
                map(transactionsChartData => transactionsChartData.map(item => item.amount).reduce((a, b) => a + b))
              )
            const transactionLoading$ = this.store$.select(state => state.list.transactions.loading)
            const transactionData$ = this.store$.select(state => state.list.transactions.data)
            const transactionOrderBy$ = this.store$.select(state => state.list.transactions.orderBy)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadTransactionsFailed)),
                this.actions$.pipe(ofType(actions.loadTransactionsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadTransactions()))
            )
            this.setupTable(
              columns[OperationTypes.Transaction]({ showFiatValue: this.isMainnet }),
              transactionData$,
              transactionLoading$,
              transactionOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Transactions on tezblock with total number of transactions and volume of the last 24 hours, the latest transactions with information about source, destination, timestamp, amount, fees, parameters and level of each transaction.">`
            })
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
              .pipe(filter(Array.isArray), map(timestampsToChartDataSource('Activations')), map(toArray))
            const activationsLoading$ = this.store$.select(state => state.list.activations.loading)
            const activationsData$ = this.store$.select(state => state.list.activations.data)
            const activationsOrderBy$ = this.store$.select(state => state.list.activations.orderBy)
            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadActivationsFailed)),
                this.actions$.pipe(ofType(actions.loadActivationsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadActivations()))
            )
            this.setupTable(
              columns[OperationTypes.Activation]({ showFiatValue: this.isMainnet }),
              activationsData$,
              activationsLoading$,
              activationsOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Activations on tezblock with the total number of activations in the last 24 hours and the last 7 days, the latest activations with information about account, timestamp, secret and level of each activation.">`
            })
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
              .pipe(filter(Array.isArray), map(timestampsToChartDataSource('Originations')), map(toArray))
            const originationsLoading$ = this.store$.select(state => state.list.originations.loading)
            const originationsData$ = this.store$.select(state => state.list.originations.data)
            const originationsOrderBy$ = this.store$.select(state => state.list.originations.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadOriginationsFailed)),
                this.actions$.pipe(ofType(actions.loadOriginationsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadOriginations()))
            )
            this.setupTable(
              columns[OperationTypes.Origination]({ showFiatValue: this.isMainnet }),
              originationsData$,
              originationsLoading$,
              originationsOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Originations on tezblock with the total number of originations in the last 24 hours and the last 7 days, the latest originations with information about the new account, timestamp, originator, baker, fee and level of each origination.">`
            })
            break
          case 'delegation':
            const delegationsLoading$ = this.store$.select(state => state.list.delegations.loading)
            const delegationsData$ = this.store$.select(state => state.list.delegations.data)
            const delegationsOrderBy$ = this.store$.select(state => state.list.delegations.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDelegationsFailed)),
                this.actions$.pipe(ofType(actions.loadDelegationsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDelegations()))
            )
            this.setupTable(
              columns[OperationTypes.Delegation]({ showFiatValue: this.isMainnet }),
              delegationsData$,
              delegationsLoading$,
              delegationsOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Delegations on tezblock with the latest delegations with information about delegator, baker, timestamp, value, fee, gas limit and level of each delegation.">`
            })
            break
          case 'endorsement':
            const endorsementsLoading$ = this.store$.select(state => state.list.endorsements.loading)
            const endorsementsData$ = this.store$.select(state => state.list.endorsements.data)
            const endorsementsOrderBy$ = this.store$.select(state => state.list.endorsements.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadEndorsementsFailed)),
                this.actions$.pipe(ofType(actions.loadEndorsementsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadEndorsements()))
            )
            this.setupTable(
              columns[OperationTypes.Endorsement]({ showFiatValue: this.isMainnet }),
              endorsementsData$,
              endorsementsLoading$,
              endorsementsOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Endorsements on tezblock with the latest endorsements with information about endorser, timestamp, slots and level of each endorsement.">`
            })
            break
          case 'vote':
            const votesLoading$ = this.store$.select(state => state.list.votes.loading)
            const votesData$ = this.store$.select(state => state.list.votes.data)
            const votesOrderBy$ = this.store$.select(state => state.list.votes.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadVotesFailed)),
                this.actions$.pipe(ofType(actions.loadVotesSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadVotes()))
            )
            this.setupTable(columns[OperationTypes.Ballot]({ showFiatValue: this.isMainnet }), votesData$, votesLoading$, votesOrderBy$)
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Votes on tezblock with the latest votes with information about baker, ballot, timestamp, kind, voting period, number of votes, proposal and level of each vote.">`
            })
            break
          case 'double-baking':
            const dbLoading$ = this.store$.select(state => state.list.doubleBakings.loading)
            const dbData$ = this.store$.select(state => state.list.doubleBakings.data)
            const dbOrderBy$ = this.store$.select(state => state.list.doubleBakings.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDoubleBakingsFailed)),
                this.actions$.pipe(ofType(actions.loadDoubleBakingsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDoubleBakings()))
            )
            this.setupTable(
              columns[OperationTypes.DoubleBakingEvidenceOverview]({ showFiatValue: this.isMainnet }),
              dbData$,
              dbLoading$,
              dbOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Double Baking Evidences on tezblock with the latest double baking evidences with information about baker, timestamp, reward, offender, denounced level, lost amount and level of each double baking evidence.">`
            })
            break
          case 'double-endorsement':
            const deLoading$ = this.store$.select(state => state.list.doubleEndorsements.loading)
            const deData$ = this.store$.select(state => state.list.doubleEndorsements.data)
            const deOrderBy$ = this.store$.select(state => state.list.doubleEndorsements.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsFailed)),
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDoubleEndorsements()))
            )
            this.setupTable(
              columns[OperationTypes.DoubleEndorsementEvidenceOverview]({ showFiatValue: this.isMainnet }),
              deData$,
              deLoading$,
              deOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Double Endorsement Evidences on tezblock with the latest double endorsement evidences with information about baker, timestamp, reward, offender, denounced level, lost amount and level of each double endorsement evidence.">`
            })
            break
          case 'bakers':
            const bakersLoading$ = this.store$.select(state => state.list.activeBakers.loading)
            const bakersData$ = this.store$.select(state => state.list.activeBakers.data)
            const bakersOrderBy$ = this.store$.select(state => state.list.activeBakers.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsFailed)),
                this.actions$.pipe(ofType(actions.loadDoubleEndorsementsSucceeded))
              ]).subscribe(() => this.store$.dispatch(actions.loadDoubleEndorsements()))
            )
            this.setupTable(
              columns[OperationTypes.DoubleEndorsementEvidenceOverview]({ showFiatValue: this.isMainnet }),
              bakersData$,
              bakersLoading$,
              bakersOrderBy$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Top 25 Tezos bakers on tezblock with information about balance, number of votes, staking balance and number of delegators.">`
            })
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
            const proposalLoading$ = this.store$.select(state => state.list.proposals.loading)
            const proposalData$ = this.store$.select(state => state.list.proposals.data)
            const proposalOrderBy$ = this.store$.select(state => state.list.proposals.orderBy)

            this.subscriptions.push(
              getRefresh([
                this.actions$.pipe(ofType(actions.loadProposalsSucceeded)),
                this.actions$.pipe(ofType(actions.loadProposalsFailed))
              ]).subscribe(() => this.store$.dispatch(actions.loadProposals()))
            )
            this.setupTable(
              columns[OperationTypes.ProposalOverview]({ showFiatValue: this.isMainnet }),
              proposalData$,
              proposalLoading$,
              proposalOrderBy$,
              showLoadMore$
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Proposals on tezblock with all the proposals with information about hash and period of each proposal.">`
            })
            break
          case 'contract':
            const loadingContracts$ = this.store$.select(state => state.list.contracts.loading)
            const contractsData$ = this.store$.select(state => state.list.contracts.data)
            const contractsOrderBy$ = this.store$.select(state => state.list.contracts.orderBy)

            this.store$.dispatch(actions.loadContracts())

            this.setupTable(
              columns[OperationTypes.Contract]({ showFiatValue: this.isMainnet }),
              contractsData$,
              loadingContracts$,
              contractsOrderBy$,
              null,
              'No Contracts'
            )
            this.metaTagService.updateTag({
              name: 'description',
              content: `Tezos Contracts on tezblock with all the contracts with information about account, balance and baker of each contract.">`
            })
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
      case 'contract':
        this.store$.dispatch(actions.increasePageOfContracts())
        break
    }
  }

  sortBy(orderBy: OrderBy) {
    switch (this.routeName) {
      case 'double-baking':
        this.store$.dispatch(actions.sortDoubleBakingsByKind({ orderBy }))
        break
      case 'double-endorsement':
        this.store$.dispatch(actions.sortDoubleEndorsementsByKind({ orderBy }))
        break
      case 'bakers':
        this.store$.dispatch(actions.sortActiveBakersByKind({ orderBy }))
        break
      case 'proposal':
        this.store$.dispatch(actions.sortProposalsByKind({ orderBy }))
        break
      case 'block':
        this.store$.dispatch(actions.sortBlocksByKind({ orderBy }))
        break
      case 'transaction':
        this.store$.dispatch(actions.sortTransactionsByKind({ orderBy }))
        break
      case 'activation':
        this.store$.dispatch(actions.sortActivationsByKind({ orderBy }))
        break
      case 'origination':
        this.store$.dispatch(actions.sortOriginationsByKind({ orderBy }))
        break
      case 'delegation':
        this.store$.dispatch(actions.sortDelegationsByKind({ orderBy }))
        break
      case 'endorsement':
        this.store$.dispatch(actions.sortEndorsementsByKind({ orderBy }))
        break
      case 'vote':
        this.store$.dispatch(actions.sortVotesByKind({ orderBy }))
        break
      case 'contract':
        this.store$.dispatch(actions.sortContracts({ orderBy }))
        break
    }
  }

  private setupTable(
    columns: Column[],
    data$: Observable<Object>,
    loading$: Observable<boolean>,
    orderBy$: Observable<OrderBy>,
    showLoadMore$?: Observable<boolean>,
    noDataLabel?: string
  ) {
    this.columns = columns
    this.data$ = data$
    this.loading$ = loading$
    this.orderBy$ = orderBy$
    this.showLoadMore$ = showLoadMore$ || of(true)
    this.noDataLabel = noDataLabel
  }
}
