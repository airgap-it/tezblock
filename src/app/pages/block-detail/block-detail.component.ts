import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { BlockSingleService } from 'src/app/services/block-single/block-single.service'

import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Block } from '../../interfaces/Block'
import { Transaction } from '../../interfaces/Transaction'
import { BlockService } from '../../services/blocks/blocks.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { TransactionSingleService } from '../../services/transaction-single/transaction-single.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
  providers: [BlockSingleService, TransactionSingleService]
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
    { title: 'Transactions', active: true, kind: 'transaction', count: 0, icon: this.iconPipe.transform('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: 0, icon: this.iconPipe.transform('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: 0, icon: this.iconPipe.transform('link') },
    { title: 'Endorsements', active: false, kind: 'endorsement', count: 0, icon: this.iconPipe.transform('stamp') },
    {
      title: 'Activations',
      active: false,
      kind: 'activate_account',
      count: 0,
      icon: this.iconPipe.transform('handHoldingSeedling')
    }
  ]

  private readonly subscriptions: Subscription = new Subscription()
  public showCurrencyPipe: boolean

  constructor(
    public readonly transactionSingleService: TransactionSingleService,
    private readonly blockSingleService: BlockSingleService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly route: ActivatedRoute,
    private readonly blockService: BlockService,
    private readonly iconPipe: IconPipe,
    public readonly chainNetworkService: ChainNetworkService
  ) {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.transactionsLoading$ = this.transactionSingleService.loading$
    this.blockLoading$ = this.blockSingleService.loading$
    this.chainNetworkService.getEnvironment().targetUrl === 'https://tezblock.io'
      ? (this.showCurrencyPipe = true)
      : (this.showCurrencyPipe = false)
  }

  public ngOnInit() {
    const paramBlockLevel = this.route.snapshot.params.id
    let blockHash: string | undefined

    this.blockSingleService.updateId(paramBlockLevel)

    this.block$ = this.blockSingleService.block$.pipe(map(blocks => blocks[0]))

    this.endorsements$ = this.block$.pipe(switchMap(block => this.blockService.getEndorsedSlotsCount(block.hash)))

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
