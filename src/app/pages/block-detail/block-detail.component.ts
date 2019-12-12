import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, merge, Observable, timer } from 'rxjs'
import { delay, map, switchMap, filter, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'
import { negate, isNil } from 'lodash'

import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Block } from '../../interfaces/Block'
import { Transaction } from '../../interfaces/Transaction'
import { BlockService } from '../../services/blocks/blocks.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { LayoutPages } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { refreshRate } from '@tezblock/services/facade/facade'

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent extends BaseComponent implements OnInit {
  public endorsements$: Observable<number> = new Observable()

  public block$: Observable<Block> = new Observable()
  public transactions$: Observable<Transaction[]>
  public transactionsLoading$: Observable<boolean>
  public blockLoading$: Observable<boolean>

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public numberOfConfirmations$: Observable<number> = new BehaviorSubject(0)

  public tabs: Tab[] = [
    { title: 'Transactions', active: true, kind: 'transaction', count: null, icon: this.iconPipe.transform('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: null, icon: this.iconPipe.transform('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: null, icon: this.iconPipe.transform('link') },
    { title: 'Endorsements', active: false, kind: 'endorsement', count: null, icon: this.iconPipe.transform('stamp') },
    {
      title: 'Activations',
      active: false,
      kind: 'activate_account',
      count: 0,
      icon: this.iconPipe.transform('handHoldingSeedling')
    }
  ]

  public isMainnet: boolean
  actionType$: Observable<LayoutPages>

  constructor(
    private readonly actions$: Actions,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly route: ActivatedRoute,
    private readonly blockService: BlockService,
    private readonly iconPipe: IconPipe,
    public readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
    this.isMainnet = this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  ngOnInit() {
    this.store$.dispatch(actions.reset())

    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.transactionsLoading$ = this.store$.select(state => state.blockDetails.busy.transactions)
    this.blockLoading$ = this.store$.select(state => state.blockDetails.busy.block)
    this.transactions$ = this.store$
      .select(state => state.blockDetails.transactions)
      .pipe(
        filter(negate(isNil)),
        delay(100) // walkaround issue with tezblock-table(*ngIf) not binding data
      )
    this.block$ = this.store$.select(state => state.blockDetails.block)
    this.endorsements$ = this.block$.pipe(switchMap(block => this.blockService.getEndorsedSlotsCount(block.hash)))
    this.numberOfConfirmations$ = combineLatest([this.blockService.latestBlock$, this.block$]).pipe(
      filter(([latestBlock, block]) => !!latestBlock && !!block),
      map(([latestBlock, block]) => latestBlock.level - block.level)
    )
    this.actionType$ = this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)).pipe(map(() => LayoutPages.Block))

    this.subscriptions.push(
      this.route.paramMap.subscribe(paramMap => this.store$.dispatch(actions.loadBlock({ id: paramMap.get('id') }))),

      // refresh block
      merge(this.actions$.pipe(ofType(actions.loadBlockSucceeded)), this.actions$.pipe(ofType(actions.loadBlockFailed)))
        .pipe(
          delay(refreshRate),
          withLatestFrom(this.store$.select(state => state.blockDetails.id)),
          map(([action, id]) => id)
        )
        .subscribe(id => this.store$.dispatch(actions.loadBlock({ id }))),

      // refresh transactions
      merge(
        this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsByKindFailed))
      )
        .pipe(
          withLatestFrom(this.store$.select(state => state.blockDetails.block), this.store$.select(state => state.blockDetails.kind)),
          switchMap(([action, block, kind]) => timer(refreshRate, refreshRate).pipe(map(() => [block.hash, kind])))
        )
        .subscribe(([blockHash, kind]) => this.store$.dispatch(actions.loadTransactionsByKind({ blockHash, kind })))
    )
  }

  tabSelected(kind: string) {
    const blockHash = fromRoot.getState(this.store$).blockDetails.block.hash

    this.store$.dispatch(actions.loadTransactionsByKind({ blockHash, kind }))
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }
}
