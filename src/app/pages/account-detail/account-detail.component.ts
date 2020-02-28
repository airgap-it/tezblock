import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { ActivatedRoute } from '@angular/router'
import { BsModalService } from 'ngx-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { from, Observable, combineLatest, merge } from 'rxjs'
import { delay, map, filter, withLatestFrom } from 'rxjs/operators'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Store } from '@ngrx/store'
import { negate, isNil } from 'lodash'
import { Actions, ofType } from '@ngrx/effects'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { RightsSingleService } from './../../services/rights-single/rights-single.service'
import { TelegramModalComponent } from './../../components/telegram-modal/telegram-modal.component'
import { QrModalComponent } from '../../components/qr-modal/qr-modal.component'
import { Tab, updateTabCounts } from '@tezblock/domain/tab'
import { Account } from '../../interfaces/Account'
import { AliasPipe } from '../../pipes/alias/alias.pipe'
import { AccountService } from '../../services/account/account.service'
import { BakingService } from '../../services/baking/baking.service'
import { CopyService } from '../../services/copy/copy.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { CycleService } from '@tezblock/services/cycle/cycle.service'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { Busy, BakerTableRatings } from './reducer'
import { OperationTypes } from '@tezblock/domain/operations'
import { refreshRate } from '@tezblock/services/facade/facade'
import { columns } from './table-definitions'
import { getRefresh } from '@tezblock/domain/synchronization'
import { OrderBy } from '@tezblock/services/base.service'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
  providers: [RightsSingleService], //TODO: refactor and remove this last single service
  animations: [
    trigger('changeBtnColor', [
      state(
        'copyTick',
        style({
          backgroundColor: 'lightgreen',
          backgroundImage: ''
        })
      ),
      transition('copyGrey =>copyTick', [animate(250, style({ transform: 'rotateY(360deg) scale(1.3)', backgroundColor: 'lightgreen' }))])
    ]),
    trigger('AnimateList', [
      transition('void => *', [style({ opacity: 0, transform: 'translateY(-75%)' }), animate('0.3s 6ms ease-in')]),

      transition('* => void', [animate('0.2s ease-out', style({ opacity: 0.01, transform: 'translateY(-75%)' }))])
    ])
  ]
})
export class AccountDetailComponent extends BaseComponent implements OnInit {
  account$: Observable<Account>
  delegatedAccountAddress: string | undefined
  relatedAccounts$: Observable<Account[]>
  delegatedAmount: number | undefined

  get bakerAddress(): string | undefined {
    return this._bakerAddress
  }
  set bakerAddress(value: string | undefined) {
    if (value !== this._bakerAddress) {
      this._bakerAddress = value
      this.store$.dispatch(actions.loadTezosBakerRating({ address: value, updateFee: true }))
    }
  }
  private _bakerAddress: string | undefined

  @ViewChild('transactions') transactions: ElementRef

  bakerTableInfos: any
  bakerTableRatings$: Observable<BakerTableRatings>
  tezosBakerFee$: Observable<number>
  tezosBakerFeeLabel$: Observable<string | undefined>

  revealed$: Observable<string>
  hasAlias: boolean | undefined
  hasLogo: boolean | undefined

  fiatCurrencyInfo$: Observable<CurrencyInfo>

  paginationLimit = 2
  numberOfInitialRelatedAccounts = 2

  isCollapsed: boolean = true

  rights$: Observable<Object> = new Observable()
  current: string = 'copyGrey'

  tabs: Tab[]
  bakerTabs: Tab[]

  rewardAmount$: Observable<string>
  rewardAmountMinusFee$: Observable<number>
  isRewardAmountMinusFeeBusy$: Observable<boolean>
  remainingTime$: Observable<string>

  get address(): string {
    return this.activatedRoute.snapshot.params.id
  }

  isMobile$: Observable<boolean>
  isBusy$: Observable<Busy>
  transactions$: Observable<any[]>
  areTransactionsLoading$: Observable<boolean>
  balanceChartDatasets$: Observable<{ data: number[]; label: string }[]>
  balanceChartLabels$: Observable<string[]>
  orderBy$: Observable<OrderBy>

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  //TODO: remove when api will be fixed
  is_baker = false

  private rewardAmountSetFor: { account: string; baker: string } = { account: undefined, baker: undefined }
  private scrolledToTransactions = false

  constructor(
    private readonly actions$: Actions,
    readonly chainNetworkService: ChainNetworkService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly accountService: AccountService,
    private readonly bakingService: BakingService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly modalService: BsModalService,
    private readonly copyService: CopyService,
    private readonly aliasPipe: AliasPipe,
    private readonly toastrService: ToastrService,
    private readonly iconPipe: IconPipe,
    private readonly rightsSingleService: RightsSingleService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly store$: Store<fromRoot.State>,
    private readonly cycleService: CycleService
  ) {
    super()
    this.store$.dispatch(actions.reset())
  }

  async ngOnInit() {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.relatedAccounts$ = this.store$.select(state => state.accountDetails.relatedAccounts)
    this.rights$ = this.rightsSingleService.rights$
    this.account$ = this.store$.select(state => state.accountDetails.account)
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Small])
      .pipe(map(breakpointState => breakpointState.matches))
    this.bakerTableRatings$ = this.store$.select(state => state.accountDetails.bakerTableRatings)
    this.tezosBakerFee$ = this.store$.select(state => state.accountDetails.tezosBakerFee)
    this.rewardAmount$ = this.store$.select(state => state.accountDetails.rewardAmont)
    this.rewardAmountMinusFee$ = combineLatest(this.rewardAmount$.pipe(map(parseFloat)), this.tezosBakerFee$).pipe(
      map(([rewardAmont, tezosBakerFee]) => (rewardAmont && tezosBakerFee ? rewardAmont - rewardAmont * (tezosBakerFee / 100) : null))
      // map(toString)
    )
    this.isRewardAmountMinusFeeBusy$ = combineLatest(
      this.store$.select(state => state.accountDetails.busy.rewardAmont),
      this.store$.select(state => state.accountDetails.rewardAmont),
      this.tezosBakerFee$
    ).pipe(
      map(
        ([isRewardAmontBusy, rewardAmont, tezosBakerFee]) => !(rewardAmont === null) && (isRewardAmontBusy || tezosBakerFee === undefined)
      )
    )
    this.isBusy$ = this.store$.select(state => state.accountDetails.busy)
    this.remainingTime$ = this.cycleService.remainingTime$
    this.transactions$ = this.store$.select(state => state.accountDetails.transactions).pipe(filter(negate(isNil)))
    this.areTransactionsLoading$ = this.store$.select(state => state.accountDetails.busy.transactions)
    this.tezosBakerFeeLabel$ = this.tezosBakerFee$.pipe(
      map(tezosBakerFee => (tezosBakerFee ? tezosBakerFee + ' %' : tezosBakerFee === null ? 'not available' : undefined))
    )
    this.balanceChartDatasets$ = this.store$
      .select(state => state.accountDetails.balanceFromLast30Days)
      .pipe(
        filter(Array.isArray),
        map(data => [{ data: data.map(dataItem => dataItem.balance), label: 'Balance' }])
      )
    this.balanceChartLabels$ = this.store$
      .select(state => state.accountDetails.balanceFromLast30Days)
      .pipe(
        filter(Array.isArray),
        map(data => data.map(dataItem => new Date(dataItem.asof).toDateString()))
      )
    this.orderBy$ = this.store$.select(state => state.accountDetails.orderBy)

    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(paramMap => {
        const address = paramMap.get('id')

        this.setTabs(address)
        this.store$.dispatch(actions.reset())
        this.store$.dispatch(actions.loadAccount({ address }))
        this.store$.dispatch(actions.loadTransactionsByKind({ kind: OperationTypes.Transaction }))
        this.store$.dispatch(actions.loadBalanceForLast30Days())
        this.getBakingInfos(address)
        this.rightsSingleService.updateAddress(address)

        if (accounts.hasOwnProperty(address) && !!this.aliasPipe.transform(address)) {
          this.hasAlias = true
          this.hasLogo = accounts[address].hasLogo
        }

        this.revealed$ = from(this.accountService.getAccountStatus(address))
      }),
      combineLatest([
        this.store$.select(state => state.accountDetails.address),
        this.store$.select(state => state.accountDetails.delegatedAccounts)
      ]).subscribe(([address, delegatedAccounts]: [string, Account[]]) => {
        if (!delegatedAccounts) {
          this.delegatedAccountAddress = undefined

          return
        }

        if (delegatedAccounts.length > 0) {
          this.delegatedAccountAddress = delegatedAccounts[0].account_id
          this.bakerAddress = delegatedAccounts[0].delegate_value
          this.delegatedAmount = delegatedAccounts[0].balance
          this.setRewardAmont()

          return
        }

        this.delegatedAccountAddress = ''
      }),

      // refresh account
      merge(this.actions$.pipe(ofType(actions.loadAccountSucceeded)), this.actions$.pipe(ofType(actions.loadAccountFailed)))
        .pipe(
          delay(refreshRate),
          withLatestFrom(this.store$.select(state => state.accountDetails.address)),
          map(([action, address]) => address)
        )
        .subscribe(address => this.store$.dispatch(actions.loadAccount({ address }))),

      // refresh transactions
      getRefresh([
        this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsByKindFailed))
      ])
        .pipe(withLatestFrom(this.store$.select(state => state.accountDetails.kind)))
        .subscribe(([action, kind]) => this.store$.dispatch(actions.loadTransactionsByKind({ kind }))),

      this.account$
        .pipe(
          withLatestFrom(this.store$.select(state => state.app.navigationHistory)),
          filter(([account, navigationHistory]) => !this.scrolledToTransactions && account && navigationHistory.length === 1),
          delay(500)
        )
        .subscribe(() => {
          this.transactions.nativeElement.scrollIntoView({ behavior: 'smooth' })
          this.scrolledToTransactions = true
        }),

      this.store$
        .select(state => state.accountDetails.counts)
        .pipe(filter(counts => !!counts))
        .subscribe(counts => (this.tabs = updateTabCounts(this.tabs, counts)))
    )
  }

  getBakingInfos(address: string) {
    this.is_baker = false

    this.bakingService.getBakerInfos(address).then(result => {
      const payoutAddress = accounts.hasOwnProperty(address) ? accounts[address].hasPayoutAddress : null

      this.bakerTableInfos = result
        ? {
            stakingBalance: result.stakingBalance,
            numberOfRolls: Math.floor(result.stakingBalance / (8000 * 1000000)),
            stakingCapacity: result.stakingCapacity,
            stakingProgress: Math.min(100, result.stakingProgress),
            stakingBond: result.selfBond,
            payoutAddress
          }
        : {
            payoutAddress
          }

      this.is_baker = true
    })

    this.store$.dispatch(actions.loadBakingBadRatings())
    this.store$.dispatch(actions.loadTezosBakerRating({ address, updateFee: false }))
  }

  private setRewardAmont() {
    const delegatedAccountIsNotABaker = this.bakerAddress !== this.address

    if (delegatedAccountIsNotABaker) {
      const notHandled = this.rewardAmountSetFor.account !== this.address || this.rewardAmountSetFor.baker !== this.bakerAddress

      if (notHandled) {
        this.rewardAmountSetFor = { account: this.address, baker: this.bakerAddress }
        this.store$.dispatch(actions.loadRewardAmont({ accountAddress: this.address, bakerAddress: this.bakerAddress }))
      }

      return
    }

    this.rewardAmountSetFor = { account: this.address, baker: this.bakerAddress }
    this.store$.dispatch(actions.loadRewardAmontSucceeded({ rewardAmont: null }))
  }

  tabSelected(kind: string) {
    this.store$.dispatch(actions.loadTransactionsByKind({ kind }))
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  showQr() {
    const initialState = { qrdata: this.address, size: 260 }
    const modalRef = this.modalService.show(QrModalComponent, { class: 'modal-sm', initialState })
    modalRef.content.closeBtnName = 'Close'
  }

  showTelegramModal() {
    const initialState = {
      botAddress: this.address,
      botName: this.aliasPipe.transform(this.address)
    }
    const modalRef = this.modalService.show(TelegramModalComponent, { initialState })
    modalRef.content.closeBtnName = 'Close'
  }

  showMoreItems() {
    this.paginationLimit = this.paginationLimit + 50 // TODO: set dynamic number
  }

  showLessItems() {
    this.paginationLimit = this.paginationLimit - 50 // TODO: set dynamic number
  }

  replaceAll(string: string, find: string, replace: string) {
    return string.replace(new RegExp(find, 'g'), replace)
  }

  changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey'
    setTimeout(() => {
      this.current = 'copyGrey'
    }, 1500)
    this.toastrService.success('has been copied to clipboard', address)
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
        title: 'Votes',
        active: false,
        kind: 'ballot',
        count: null,
        icon: this.iconPipe.transform('boxBallot'),
        columns: columns[OperationTypes.Ballot]({ pageId, showFiatValue: this.isMainnet })
      }
    ]

    this.bakerTabs = [
      { title: 'Baker Overview', active: true, kind: 'baker_overview', count: null, icon: this.iconPipe.transform('hatChef') },
      { title: 'Baking Rights', active: false, kind: 'baking_rights', count: null, icon: this.iconPipe.transform('breadLoaf') },
      { title: 'Endorsing Rights', active: false, kind: 'endorsing_rights', count: null, icon: this.iconPipe.transform('stamp') },
      { title: 'Rewards', active: false, kind: 'rewards', count: null, icon: this.iconPipe.transform('coin') }
    ]
  }
}
