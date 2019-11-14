import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import BigNumber from 'bignumber.js'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'

import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Transaction } from '../../interfaces/Transaction'
import { BlockService } from '../../services/blocks/blocks.service'
import { CopyService } from '../../services/copy/copy.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { TransactionSingleService } from '../../services/transaction-single/transaction-single.service'

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  providers: [TransactionSingleService]
})
export class TransactionDetailComponent implements OnInit {
  public latestTx$: Observable<Transaction> = new Observable()

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public numberOfConfirmations$: Observable<number> = new BehaviorSubject(0)

  public totalAmount$: Observable<BigNumber> = new Observable()
  public totalFee$: Observable<BigNumber> = new Observable()

  public tabs: Tab[] = [
    { title: 'Transactions', active: true, kind: 'transaction', count: 0, icon: this.iconPipe.transform('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: 0, icon: this.iconPipe.transform('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: 0, icon: this.iconPipe.transform('link') },
    { title: 'Reveals', active: false, kind: 'reveal', count: 0, icon: this.iconPipe.transform('eye') },
    { title: 'Activations', active: false, kind: 'activate_account', count: 0, icon: this.iconPipe.transform('handHoldingSeedling') },
    { title: 'Votes', active: false, kind: 'ballot', count: 0, icon: this.iconPipe.transform('boxBallot') }
  ]

  private readonly kind = new BehaviorSubject(this.tabs[0].kind)
  public transactionsLoading$: Observable<boolean> = new Observable()
  public transactions$: Observable<Transaction[]> = new Observable()
  public filteredTransactions$: Observable<Transaction[]> = new Observable()
  constructor(
    public readonly transactionSingleService: TransactionSingleService,
    private readonly route: ActivatedRoute,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly blockService: BlockService,
    private readonly copyService: CopyService,
    private readonly iconPipe: IconPipe
  ) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
  }

  public ngOnInit() {
    const transactionHash = this.route.snapshot.params.id

    this.transactionSingleService.updateTransactionHash(transactionHash)

    this.transactionsLoading$ = this.transactionSingleService.loading$
    this.transactions$ = this.transactionSingleService.transactions$
    this.latestTx$ = this.transactions$.pipe(map(transactions => transactions[0]))

    /* this.totalAmount$ = this.transactions$.pipe(
      map(transactions => {
        if (transactions) {
          transactions.reduce((pv, cv) => {
            if (cv.amount) {
              pv.plus(cv.amount), new BigNumber(0)
            }
          })
        }
      })
    ) */

    // Update the active "tab" of the table
    this.filteredTransactions$ = combineLatest([this.transactions$, this.kind]).pipe(
      map(([transactions, kind]) => {
        return transactions.filter(transaction => {
          return transaction.kind === kind
        })
      })
    )

    this.numberOfConfirmations$ = combineLatest([this.blockService.latestBlock$, this.latestTx$]).pipe(
      switchMap(([latestBlock, transaction]) => {
        if (!latestBlock) {
          return new Observable<number>()
        }

        return new Observable<number>(observer => {
          observer.next(latestBlock.level - transaction.block_level)
        })
      })
    )
    this.totalAmount$ = this.transactions$.pipe(map(transactions => transactions.reduce((pv, cv) => pv.plus(cv.amount), new BigNumber(0))))
    this.totalFee$ = this.transactions$.pipe(map(transactions => transactions.reduce((pv, cv) => pv.plus(cv.fee), new BigNumber(0))))
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public tabSelected(tab: string) {
    this.kind.next(tab)
  }
}
