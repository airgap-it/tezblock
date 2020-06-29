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
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { refreshRate } from '@tezblock/domain/synchronization'
import { columns } from './table-definitions'
import { OperationTypes } from '@tezblock/domain/operations'
import { updateTabCounts } from '@tezblock/domain/tab'
import { OrderBy } from '@tezblock/services/base.service'
import { ApiService } from '@tezblock/services/api/api.service'
import { getRefresh } from '@tezblock/domain/synchronization'
import { Title, Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent extends BaseComponent implements OnInit {
  endorsements$: Observable<number> = new Observable()

  block$: Observable<Block>
  latestBlock$: Observable<Block>
  transactions$: Observable<Transaction[]>
  transactionsLoading$: Observable<boolean>
  blockLoading$: Observable<boolean>

  numberOfConfirmations$: Observable<number> = new BehaviorSubject(0)

  tabs: Tab[]

  orderBy$: Observable<OrderBy>

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly iconPipe: IconPipe,
    readonly chainNetworkService: ChainNetworkService,
    private readonly store$: Store<fromRoot.State>,
    private titleService: Title,
    private metaTagService: Meta,
    private readonly activatedRoute: ActivatedRoute
  ) {
    super()
  }

  ngOnInit() {
    this.transactionsLoading$ = this.store$.select(state => state.blockDetails.transactions.loading)
    this.blockLoading$ = this.store$.select(state => state.blockDetails.busy.block)
    this.transactions$ = this.store$.select(state => state.blockDetails.transactions.data).pipe(filter(negate(isNil)))
    this.block$ = this.store$.select(state => state.blockDetails.block)
    this.latestBlock$ = this.store$.select(state => state.app.latestBlock)
    this.endorsements$ = this.block$.pipe(
      filter(negate(isNil)),
      switchMap(block => this.apiService.getEndorsedSlotsCount(block.hash))
    )
    this.numberOfConfirmations$ = combineLatest([this.store$.select(state => state.app.latestBlock), this.block$]).pipe(
      filter(([latestBlock, block]) => !!latestBlock && !!block),
      map(([latestBlock, block]) => latestBlock.level - block.level)
    )
    this.orderBy$ = this.store$.select(state => state.blockDetails.transactions.orderBy)

    this.subscriptions.push(
      this.route.paramMap.subscribe(paramMap => {
        const id: string = paramMap.get('id')

        this.store$.dispatch(actions.reset())
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
          withLatestFrom(
            this.store$.select(state => state.blockDetails.block),
            this.store$.select(state => state.blockDetails.kind)
          ),
          switchMap(([action, block, kind]) => timer(refreshRate, refreshRate).pipe(map(() => [block.hash, kind])))
        )
        .subscribe(([blockHash, kind]) => this.store$.dispatch(actions.loadTransactionsByKind({ blockHash, kind }))),

      this.store$
        .select(state => state.blockDetails.counts)
        .pipe(filter(counts => !!counts))
        .subscribe(counts => (this.tabs = updateTabCounts(this.tabs, counts)))
    )
    this.store$
      .select(state => state.blockDetails.id)
      .subscribe(id => {
        this.titleService.setTitle(`Block ${id} - tezblock`)
        this.metaTagService.updateTag({
          name: 'description',
          content: `Tezos Block Height ${id}. The timestamp, block reward, baker, value, fees and number of transactions in the block are detailed on tezblock.">`
        })
      })
  }

  tabSelected(kind: string) {
    const blockHash = fromRoot.getState(this.store$).blockDetails.block.hash

    this.store$.dispatch(actions.loadTransactionsByKind({ blockHash, kind }))
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  sortBy(orderBy: OrderBy) {
    this.store$.dispatch(actions.sortTransactionsByKind({ orderBy }))
  }

  private setTabs(pageId: string) {
    this.tabs = [
      {
        title: 'Transactions',
        active: true,
        kind: 'transaction',
        count: undefined,
        icon: this.iconPipe.transform('exchangeAlt'),
        columns: columns[OperationTypes.Transaction]({ pageId, showFiatValue: this.isMainnet }),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: 'Delegations',
        active: false,
        kind: 'delegation',
        count: undefined,
        icon: this.iconPipe.transform('handReceiving'),
        columns: columns[OperationTypes.Delegation]({ pageId, showFiatValue: this.isMainnet }),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: 'Originations',
        active: false,
        kind: 'origination',
        count: undefined,
        icon: this.iconPipe.transform('link'),
        columns: columns[OperationTypes.Origination]({ pageId, showFiatValue: this.isMainnet }),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: 'Endorsements',
        active: false,
        kind: 'endorsement',
        count: undefined,
        icon: this.iconPipe.transform('stamp'),
        columns: columns[OperationTypes.Endorsement]({ pageId, showFiatValue: this.isMainnet }),
        disabled: function() {
          return !this.count
        }
      },
      {
        title: 'Activations',
        active: false,
        kind: 'activate_account',
        count: undefined,
        icon: this.iconPipe.transform('handHoldingSeedling'),
        columns: columns[OperationTypes.Activation]({ pageId, showFiatValue: this.isMainnet }),
        disabled: function() {
          return !this.count
        }
      }
    ]
  }

  changeBlock(change: number) {
    this.store$.dispatch(actions.changeBlock({ change }))
  }
}
