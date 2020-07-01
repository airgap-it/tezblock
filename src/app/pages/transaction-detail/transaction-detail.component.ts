import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, merge, Observable, timer } from 'rxjs'
import { map, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { Tab, updateTabCounts } from '@tezblock/domain/tab'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { CopyService } from '@tezblock/services/copy/copy.service'
import { CurrencyInfo } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { first } from '@tezblock/services/fp'
import { refreshRate } from '@tezblock/domain/synchronization'
import { negate, isNil } from 'lodash'
import { columns } from './table-definitions'
import { OperationTypes } from '@tezblock/domain/operations'
import { OrderBy } from '@tezblock/services/base.service'
import { TranslateService } from '@ngx-translate/core'
import { Title, Meta } from '@angular/platform-browser'
import { AliasService } from '@tezblock/services/alias/alias.service'

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent extends BaseComponent implements OnInit {
  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  get transactionHash(): string {
    return this.activatedRoute.snapshot.params.id
  }

  tabs: Tab[]
  latestTx$: Observable<Transaction>
  fiatCurrencyInfo$: Observable<CurrencyInfo>
  numberOfConfirmations$: Observable<number>
  totalAmount$: Observable<number>
  // totalFee$: Observable<number>
  transactionsLoading$: Observable<boolean>
  transactions$: Observable<Transaction[]>
  filteredTransactions$: Observable<Transaction[]>
  isInvalidHash$: Observable<boolean>
  orderBy$: Observable<OrderBy>

  private kind$: Observable<string>

  constructor(
    private readonly actions$: Actions,
    private readonly route: ActivatedRoute,
    private readonly copyService: CopyService,
    private readonly iconPipe: IconPipe,
    readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>,
    private translateService: TranslateService,
    private readonly activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaTagService: Meta,

    private aliasService: AliasService
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.kind$ = this.store$.select(state => state.transactionDetails.kind)
    this.fiatCurrencyInfo$ = this.store$.select(state => state.app.fiatCurrencyInfo)
    this.transactionsLoading$ = this.store$.select(state => state.transactionDetails.transactions.loading)
    this.transactions$ = this.store$.select(state => state.transactionDetails.transactions.data).pipe(filter(negate(isNil)))
    this.latestTx$ = this.transactions$.pipe(map(first))
    this.totalAmount$ = this.store$.select(state => state.transactionDetails.totalAmount)
    // this.totalFee$ = this.store$.select(state => state.transactionDetails.totalFee)
    this.isInvalidHash$ = this.store$
      .select(state => state.transactionDetails.transactions.data)
      .pipe(map(transactions => transactions === null))
    this.orderBy$ = this.store$.select(state => state.transactionDetails.transactions.orderBy)

    // Update the active "tab" of the table
    this.filteredTransactions$ = combineLatest([this.transactions$, this.kind$]).pipe(
      filter(([transactions, kind]) => Array.isArray(transactions)),
      map(([transactions, kind]) =>
        transactions.filter(transaction => (Array.isArray(kind) ? kind.indexOf(transaction.kind) !== -1 : transaction.kind === kind))
      )
    )

    this.numberOfConfirmations$ = combineLatest([this.store$.select(state => state.transactionDetails.latestBlock), this.latestTx$]).pipe(
      filter(([latestBlock, transaction]) => !!latestBlock),
      map(([latestBlock, transaction]) => latestBlock.level - transaction.block_level)
    )

    this.subscriptions.push(
      this.route.paramMap.subscribe(paramMap => {
        this.store$.dispatch(actions.loadTransactionsByHash({ transactionHash: paramMap.get('id') }))
        this.setTabs(paramMap.get('id'))
      }),

      // refresh latest block
      timer(0, refreshRate).subscribe(() => this.store$.dispatch(actions.loadLatestBlock())),

      // refresh transactions
      merge(
        this.actions$.pipe(ofType(actions.loadTransactionsByHashSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsByHashFailed))
      )
        .pipe(
          withLatestFrom(this.store$.select(state => state.transactionDetails.transactionHash)),
          switchMap(([action, transactionHash]) => timer(refreshRate, refreshRate).pipe(map(() => transactionHash)))
        )
        .subscribe(transactionHash => this.store$.dispatch(actions.loadTransactionsByHash({ transactionHash }))),

      this.store$
        .select(state => state.transactionDetails.counts)
        .pipe(filter(counts => !!counts))
        .subscribe(counts => (this.tabs = updateTabCounts(this.tabs, counts)))
    )
    this.titleService.setTitle(`Operation ${this.aliasService.getFormattedAddress(this.transactionHash)} - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Transaction ${this.transactionHash}. The transaction hash, block level, timestamp, value, fees and and tranfers are detailed on tezblock.">`
    })
  }

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  tabSelected(kind: string) {
    this.store$.dispatch(actions.changeKind({ kind }))
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  sortBy(orderBy: OrderBy) {
    this.store$.dispatch(actions.sortTransactionsByKind({ orderBy }))
  }

  private setTabs(pageId: string) {
    const showFiatValue = this.isMainnet

    this.tabs = [
      {
        title: this.translateService.instant('tabbed-table.transaction-detail.transactions'),
        active: true,
        kind: 'transaction',
        count: undefined,
        icon: this.iconPipe.transform('exchangeAlt'),
        columns: columns[OperationTypes.Transaction]({ pageId, showFiatValue }, this.translateService),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: this.translateService.instant('tabbed-table.transaction-detail.delegations'),
        active: false,
        kind: 'delegation',
        count: undefined,
        icon: this.iconPipe.transform('handReceiving'),
        columns: columns[OperationTypes.Delegation]({ pageId, showFiatValue }, this.translateService),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: this.translateService.instant('tabbed-table.transaction-detail.originations'),
        active: false,
        kind: 'origination',
        count: undefined,
        icon: this.iconPipe.transform('link'),
        columns: columns[OperationTypes.Origination]({ pageId, showFiatValue }, this.translateService),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: this.translateService.instant('tabbed-table.transaction-detail.reveals'),
        active: false,
        kind: 'reveal',
        count: undefined,
        icon: this.iconPipe.transform('eye'),
        columns: columns[OperationTypes.Reveal]({ pageId, showFiatValue }, this.translateService),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: this.translateService.instant('tabbed-table.transaction-detail.activations'),
        active: false,
        kind: 'activate_account',
        count: undefined,
        icon: this.iconPipe.transform('handHoldingSeedling'),
        columns: columns[OperationTypes.Activation]({ pageId, showFiatValue }, this.translateService),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: this.translateService.instant('tabbed-table.transaction-detail.votes'),
        active: false,
        kind: ['ballot', 'proposals'],
        count: undefined,
        icon: this.iconPipe.transform('boxBallot'),
        columns: columns[OperationTypes.Ballot]({ pageId, showFiatValue }, this.translateService),
        disabled: function() {
          return !this.count
        }
      }
    ]
  }
}
