import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { BlockSingleService } from 'src/app/services/block-single/block-single.service'

import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Block } from '../../interfaces/Block'
import { Transaction } from '../../interfaces/Transaction'
import { ApiService } from '../../services/api/api.service'
import { BlockService } from '../../services/blocks/blocks.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { IconService } from '../../services/icon/icon.service'
import { TransactionSingleService } from '../../services/transaction-single/transaction-single.service'

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent implements OnInit, OnDestroy {
  public endorsements$: Observable<number> = new Observable()

  public block$: Observable<Block> = new Observable()
  public transactions$: Observable<Transaction[]> = new Observable()
  public transactionsLoading$: Observable<boolean>
  public blockLoading$: Observable<boolean>

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public numberOfConfirmations$: Observable<number> = new BehaviorSubject(0)

  public tabs: Tab[] = [
    { title: 'Transactions', active: true, kind: 'transaction', count: 0, icon: this.iconService.iconProperties('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: 0, icon: this.iconService.iconProperties('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: 0, icon: this.iconService.iconProperties('link') },
    { title: 'Endorsements', active: false, kind: 'endorsement', count: 0, icon: this.iconService.iconProperties('stamp') },
    {
      title: 'Activations',
      active: false,
      kind: 'activate_account',
      count: 0,
      icon: this.iconService.iconProperties('handHoldingSeedling')
    }
  ]

  public readonly transactionSingleService: TransactionSingleService
  private readonly blockSingleService: BlockSingleService

  private readonly subscriptions: Subscription = new Subscription()

  constructor(
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly route: ActivatedRoute,
    private readonly blockService: BlockService,
    private readonly apiService: ApiService,
    private readonly iconService: IconService
  ) {
    this.transactionSingleService = new TransactionSingleService(this.apiService)
    this.blockSingleService = new BlockSingleService(this.blockService)

    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.transactionsLoading$ = this.transactionSingleService.loading$
    this.blockLoading$ = this.blockSingleService.loading$
  }

  public ngOnInit() {
    const paramBlockLevel = this.route.snapshot.params.id
    let blockHash: string | undefined

    this.blockSingleService.updateId(paramBlockLevel)

    this.block$ = this.blockSingleService.block$.pipe(map(blocks => blocks[0]))

    this.endorsements$ = this.block$.pipe(switchMap(block => this.blockService.getEndorsements(block.hash)))

    this.numberOfConfirmations$ = combineLatest([this.blockService.latestBlock$, this.block$]).pipe(
      switchMap(([latestBlock, block]) => {
        if (!latestBlock || !block) {
          return new Observable<number>()
        }

        return new Observable<number>(observer => {
          observer.next(latestBlock.level - block.level)
        })
      })
    )
    this.transactions$ = this.transactionSingleService.transactions$

    // TODO: Try to  get rid of this subscription
    this.subscriptions.add(
      this.block$.subscribe((block: Block) => {
        if (block) {
          if (block.hash !== blockHash) {
            this.transactionSingleService.updateBlockHash(block.hash)
            blockHash = block.hash
          }
        }

        // console.log(await this.blockService.getAdditionalBlockData([block]))
      })
    )
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  public tabSelected(tab: string) {
    this.transactionSingleService.updateKind(tab)
  }
}
