import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, combineLatest, merge, Observable, timer } from 'rxjs'
import { delay, map, switchMap, filter, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'
import { negate, isNil } from 'lodash'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { Tab } from '@tezblock/domain/tab'
import { Block } from '../../interfaces/Block'
import { Transaction } from '../../interfaces/Transaction'
import { BlockService } from '../../services/blocks/blocks.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { refreshRate } from '@tezblock/services/facade/facade'
import { columns } from './table-definitions'
import { OperationTypes, LayoutPages } from '@tezblock/domain/operations'
import { updateTabCounts } from '@tezblock/domain/tab'

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

  public tabs: Tab[]

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

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
    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.transactionsLoading$ = this.store$.select(state => state.blockDetails.busy.transactions)
    this.blockLoading$ = this.store$.select(state => state.blockDetails.busy.block)
    this.transactions$ = this.store$.select(state => state.blockDetails.transactions).pipe(filter(negate(isNil)))
    this.block$ = this.store$.select(state => state.blockDetails.block)
    this.endorsements$ = this.block$.pipe(switchMap(block => this.blockService.getEndorsedSlotsCount(block.hash)))
    this.numberOfConfirmations$ = combineLatest([this.blockService.latestBlock$, this.block$]).pipe(
      filter(([latestBlock, block]) => !!latestBlock && !!block),
      map(([latestBlock, block]) => latestBlock.level - block.level)
    )

    this.subscriptions.push(
      this.route.paramMap.subscribe(paramMap => {
        const id: string = paramMap.get('id')

        this.store$.dispatch(actions.loadBlock({ id }))
        this.setTabs(id)
      }),

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
        .subscribe(([blockHash, kind]) => this.store$.dispatch(actions.loadTransactionsByKind({ blockHash, kind }))),

      this.store$
        .select(state => state.blockDetails.counts)
        .pipe(filter(counts => !!counts))
        .subscribe(counts => (this.tabs = updateTabCounts(this.tabs, counts)))
    )
  }

  tabSelected(kind: string) {
    const blockHash = fromRoot.getState(this.store$).blockDetails.block.hash

    this.store$.dispatch(actions.loadTransactionsByKind({ blockHash, kind }))
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  private setTabs(pageId: string) {
    this.tabs = [
      {
        title: 'Transactions',
        active: true,
        kind: 'transaction',
        count: null,
        icon: this.iconPipe.transform('exchangeAlt'),
        columns: columns[OperationTypes.Transaction]({ pageId, showFiatValue: this.isMainnet })
      },
      {
        title: 'Delegations',
        active: false,
        kind: 'delegation',
        count: null,
        icon: this.iconPipe.transform('handReceiving'),
        columns: columns[OperationTypes.Delegation]({ pageId, showFiatValue: this.isMainnet })
      },
      {
        title: 'Originations',
        active: false,
        kind: 'origination',
        count: null,
        icon: this.iconPipe.transform('link'),
        columns: columns[OperationTypes.Origination]({ pageId, showFiatValue: this.isMainnet })
      },
      {
        title: 'Endorsements',
        active: false,
        kind: 'endorsement',
        count: null,
        icon: this.iconPipe.transform('stamp'),
        columns: columns[OperationTypes.Endorsement]({ pageId, showFiatValue: this.isMainnet })
      },
      {
        title: 'Activations',
        active: false,
        kind: 'activate_account',
        count: 0,
        icon: this.iconPipe.transform('handHoldingSeedling'),
        columns: columns[OperationTypes.Activation]({ pageId, showFiatValue: this.isMainnet })
      }
    ]
  }
}
