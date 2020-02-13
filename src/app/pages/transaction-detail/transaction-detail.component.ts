import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import BigNumber from 'bignumber.js'
import { BehaviorSubject, combineLatest, merge, Observable, timer } from 'rxjs'
import { map, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { Tab } from '@tezblock/components/tabbed-table/tabbed-table.component'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { CopyService } from '@tezblock/services/copy/copy.service'
import { CryptoPricesService, CurrencyInfo } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { first } from '@tezblock/services/fp'
import { LayoutPages } from '@tezblock/domain/operations'
import { refreshRate } from '@tezblock/services/facade/facade'
import { negate, isNil } from 'lodash'
import { columns } from './table-definitions'
import { OperationTypes } from '@tezblock/domain/operations'

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent extends BaseComponent implements OnInit {
  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  tabs: Tab[]
  latestTx$: Observable<Transaction>
  fiatCurrencyInfo$: Observable<CurrencyInfo>
  numberOfConfirmations$: Observable<number>
  totalAmount$: Observable<BigNumber>
  totalFee$: Observable<BigNumber>
  transactionsLoading$: Observable<boolean>
  transactions$: Observable<Transaction[]>
  filteredTransactions$: Observable<Transaction[]>
  actionType$: Observable<LayoutPages>
  isInvalidHash$: Observable<boolean>

  private kind$ = new BehaviorSubject('transaction')

  constructor(
    private readonly actions$: Actions,
    private readonly route: ActivatedRoute,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly copyService: CopyService,
    private readonly iconPipe: IconPipe,
    readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.transactionsLoading$ = this.store$.select(state => state.transactionDetails.busy.transactions)
    this.transactions$ = this.store$.select(state => state.transactionDetails.transactions).pipe(filter(negate(isNil)))
    this.latestTx$ = this.transactions$.pipe(map(first))
    this.totalAmount$ = this.transactions$.pipe(map(transactions => transactions.reduce((pv, cv) => pv.plus(cv.amount), new BigNumber(0))))
    this.totalFee$ = this.transactions$.pipe(map(transactions => transactions.reduce((pv, cv) => pv.plus(cv.fee), new BigNumber(0))))
    this.actionType$ = this.latestTx$.pipe(map(() => LayoutPages.Transaction))
    this.isInvalidHash$ = this.store$
      .select(state => state.transactionDetails.transactions)
      .pipe(map(transactions => transactions === null || (Array.isArray(transactions) && transactions.length === 0)))

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
        .subscribe(transactionHash => this.store$.dispatch(actions.loadTransactionsByHash({ transactionHash })))
    )
  }

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  tabSelected(kind: string) {
    this.kind$.next(kind)
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  sortBy(data: any) {
    this.store$.dispatch(actions.sortTransactionsByKind({ sortingValue: data.value, sortingDirection: data.sortingDirection }))
  }

  private setTabs(pageId: string) {
    const showFiatValue = this.isMainnet

    this.tabs = [
      {
        title: 'Transactions',
        active: true,
        kind: 'transaction',
        count: null,
        icon: this.iconPipe.transform('exchangeAlt'),
        columns: columns[OperationTypes.Transaction]({ pageId, showFiatValue })
      },
      {
        title: 'Delegations',
        active: false,
        kind: 'delegation',
        count: null,
        icon: this.iconPipe.transform('handReceiving'),
        columns: columns[OperationTypes.Delegation]({ pageId, showFiatValue })
      },
      {
        title: 'Originations',
        active: false,
        kind: 'origination',
        count: null,
        icon: this.iconPipe.transform('link'),
        columns: columns[OperationTypes.Origination]({ pageId, showFiatValue })
      },
      {
        title: 'Reveals',
        active: false,
        kind: 'reveal',
        count: null,
        icon: this.iconPipe.transform('eye'),
        columns: columns[OperationTypes.Reveal]({ pageId, showFiatValue })
      },
      {
        title: 'Activations',
        active: false,
        kind: 'activate_account',
        count: null,
        icon: this.iconPipe.transform('handHoldingSeedling'),
        columns: columns[OperationTypes.Activation]({ pageId, showFiatValue })
      },
      {
        title: 'Votes',
        active: false,
        kind: ['ballot', 'proposals'],
        count: null,
        icon: this.iconPipe.transform('boxBallot'),
        columns: columns[OperationTypes.Ballot]({ pageId, showFiatValue })
      }
    ]
  }
}
