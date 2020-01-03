import { RightsSingleService } from './../../services/rights-single/rights-single.service'
import { TelegramModalComponent } from './../../components/telegram-modal/telegram-modal.component'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BsModalService } from 'ngx-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { from, Observable, combineLatest, merge, timer } from 'rxjs'
import { delay, map, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Store } from '@ngrx/store'
import { negate, isNil } from 'lodash'
import { Actions, ofType } from '@ngrx/effects'

import { QrModalComponent } from '../../components/qr-modal/qr-modal.component'
import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Account } from '../../interfaces/Account'
import { AliasPipe } from '../../pipes/alias/alias.pipe'
import { AccountService } from '../../services/account/account.service'
import { BakingService } from '../../services/baking/baking.service'
import { CopyService } from '../../services/copy/copy.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { CycleService } from '@tezblock/services/cycle/cycle.service'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { TezosRewards, TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { BaseComponent } from '@tezblock/components/base.component'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { Busy } from './reducer'
import { LayoutPages, OperationTypes } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { refreshRate } from '@tezblock/services/facade/facade'

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
  relatedAccounts: Observable<Account[]>
  delegatedAmount: number | undefined

  get bakerAddress(): string | undefined {
    return this._bakerAddress
  }
  set bakerAddress(value: string | undefined) {
    if (value !== this._bakerAddress) {
      this._bakerAddress = value
      this.getTezosBakerInfos(value, true)
    }
  }
  private _bakerAddress: string | undefined

  bakingBadRating: string | undefined
  tezosBakerRating: string | undefined
  stakingBalance: number | undefined
  bakingInfos: any
  bakerTableInfos: any
  bakerTableRatings: any = {}

  tezosBakerFee: string | undefined
  stakingCapacity: number | undefined
  stakingProgress: number | undefined
  stakingBond: number | undefined

  isValidBaker: boolean | undefined
  revealed$: Observable<string>
  hasAlias: boolean | undefined
  hasLogo: boolean | undefined

  tezosBakerName: string | undefined
  tezosBakerAvailableCap: string | undefined
  tezosBakerAcceptingDelegation: string | undefined
  tezosBakerNominalStakingYield: string | undefined

  fiatCurrencyInfo$: Observable<CurrencyInfo>

  paginationLimit: number = 2
  numberOfInitialRelatedAccounts: number = 2

  isCollapsed: boolean = true

  rewards: TezosRewards
  rights$: Observable<Object> = new Observable()
  current: string = 'copyGrey'

  tabs: Tab[] = [
    { title: 'Transactions', active: true, kind: 'transaction', count: null, icon: this.iconPipe.transform('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: null, icon: this.iconPipe.transform('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: null, icon: this.iconPipe.transform('link') },
    { title: 'Endorsements', active: false, kind: 'endorsement', count: null, icon: this.iconPipe.transform('stamp') },
    { title: 'Votes', active: false, kind: 'ballot', count: null, icon: this.iconPipe.transform('boxBallot') }
  ]
  bakerTabs: Tab[] = [
    { title: 'Baker Overview', active: true, kind: 'baker_overview', count: null, icon: this.iconPipe.transform('hatChef') },
    { title: 'Baking Rights', active: false, kind: 'baking_rights', count: null, icon: this.iconPipe.transform('breadLoaf') },
    { title: 'Endorsing Rights', active: false, kind: 'endorsing_rights', count: null, icon: this.iconPipe.transform('stamp') },
    { title: 'Rewards', active: false, kind: 'rewards', count: null, icon: this.iconPipe.transform('coin') }
  ]
  nextPayout: Date | undefined
  rewardAmount$: Observable<string>
  remainingTime$: Observable<string>
  myTBUrl: string | undefined
  get address(): string {
    return this.route.snapshot.params.id
  }
  frozenBalance: number | undefined
  rewardsTransaction: any
  isMobile$: Observable<boolean>
  isBusy$: Observable<Busy>
  isMainnet: boolean
  transactions$: Observable<any[]>
  areTransactionsLoading$: Observable<boolean>
  actionType$: Observable<LayoutPages>
  delegationsChartDatasets$: Observable<{ data: number[]; label: string }[]>
  delegationsChartLabels$: Observable<string[]>

  private rewardAmountSetFor: { account: string; baker: string } = { account: undefined, baker: undefined }

  constructor(
    private readonly actions$: Actions,
    readonly chainNetworkService: ChainNetworkService,
    private readonly route: ActivatedRoute,
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
    this.isMainnet = this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  async ngOnInit() {
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$
    this.relatedAccounts = this.store$.select(state => state.accountDetails.relatedAccounts)
    this.rights$ = this.rightsSingleService.rights$
    this.account$ = this.store$.select(state => state.accountDetails.account)
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.HandsetLandscape, Breakpoints.HandsetPortrait])
      .pipe(map(breakpointState => breakpointState.matches))
    this.rewardAmount$ = this.store$.select(state => state.accountDetails.rewardAmont)
    this.isBusy$ = this.store$.select(state => state.accountDetails.busy)
    this.remainingTime$ = this.cycleService.remainingTime$
    this.transactions$ = this.store$
      .select(state => state.accountDetails.transactions)
      .pipe(
        filter(negate(isNil)),
        delay(100) // walkaround issue with tezblock-table(*ngIf) not binding data
      )
    this.areTransactionsLoading$ = this.store$.select(state => state.accountDetails.busy.transactions)
    this.actionType$ = this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)).pipe(map(() => LayoutPages.Account))
    this.delegationsChartDatasets$ = this.store$.select(state => state.accountDetails.delegationsFromLast30Days).pipe(
      filter(Array.isArray),
      map(data => [{ data: data.map(dataItem => dataItem.balance), label: 'Balance' }])
    )
    this.delegationsChartLabels$ = this.store$.select(state => state.accountDetails.delegationsFromLast30Days).pipe(
      filter(Array.isArray),
      map(data => data.map(dataItem => new Date(dataItem.asof).toDateString()))
    )

    this.subscriptions.push(
      this.route.paramMap.subscribe(paramMap => {
        const address = paramMap.get('id')

        this.store$.dispatch(actions.reset())
        this.store$.dispatch(actions.loadAccount({ address }))
        this.store$.dispatch(actions.loadTransactionsByKind({ kind: OperationTypes.Transaction }))
        this.store$.dispatch(actions.loadDelegationsForLast30Days())
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
        } else if (delegatedAccounts.length > 0) {
          this.delegatedAccountAddress = delegatedAccounts[0].account_id
          this.bakerAddress = delegatedAccounts[0].delegate_value
          this.delegatedAmount = delegatedAccounts[0].balance
          this.setRewardAmont()
        } else {
          this.delegatedAccountAddress = ''
        }
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
      merge(
        this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsByKindFailed))
      )
        .pipe(
          withLatestFrom(this.store$.select(state => state.accountDetails.kind)),
          switchMap(([action, kind]) => timer(refreshRate, refreshRate).pipe(map(() => kind)))
        )
        .subscribe(kind => this.store$.dispatch(actions.loadTransactionsByKind({ kind })))
    )
  }

  async getBakingInfos(address: string) {
    this.bakingService
      .getBakerInfos(address)
      .then(async result => {
        this.isValidBaker = true
        const payoutAddress = accounts.hasOwnProperty(address) ? accounts[address].hasPayoutAddress : null

        this.bakerTableInfos = result
          ? {
              stakingBalance: result.stakingBalance,
              numberOfRolls: Math.floor(result.stakingBalance / (8000 * 1000000)),
              stakingCapacity: result.stakingCapacity,
              stakingProgress: Math.min(100, result.stakingProgress),
              stakingBond: result.selfBond,
              frozenBalance: await this.accountService.getFrozen(address),
              payoutAddress
            }
          : {
              payoutAddress
            }
      })
      .catch(error => {
        this.isValidBaker = false
      })

    // this.nextPayout = this.bakingInfos.nextPayout
    // this.rewardAmount = this.bakingInfos.avgRoI.dividedBy(1000000).toNumber()

    // TODO: Move to component

    this.bakingService
      .getBakingBadRatings(address)
      .then(result => {
        if (result.rating === 0 && result.status === 'success') {
          this.bakingBadRating = 'awesome'
        } else if (result.rating === 1 && result.status === 'success') {
          this.bakingBadRating = 'so-so'
        } else if (result.rating === 2 && result.status === 'success') {
          this.bakingBadRating = 'dead'
        } else if (result.rating === 3 && result.status === 'success') {
          this.bakingBadRating = 'specific'
        } else if (result.rating === 4 && result.status === 'success') {
          this.bakingBadRating = 'hidden'
        } else if (result.rating === 5 && result.status === 'success') {
          this.bakingBadRating = 'new'
        } else if (result.rating === 6 && result.status === 'success') {
          this.bakingBadRating = 'closed'
        } else if (result.rating === 9 && result.status === 'success') {
          this.bakingBadRating = 'unknown'
        } else {
          this.bakingBadRating = 'not available'
        }

        this.bakerTableRatings = {
          ...this.bakerTableRatings,
          bakingBadRating: this.bakingBadRating
        }
      })
      .catch(error => {
        this.isValidBaker = false
      })

    this.getTezosBakerInfos(address)
  }

  // TODO: Move to component
  /*  TODO: strange only tezosBakerFee & bakerTableRatings.tezosBakerRating seems to be consumed by anything,
      what for are all other properties updated here */
  /**
   * @param {boolean} [updateFee] - this method was used only in getBakingInfos method ( from my reasoning only to
   * update bakerTableRatings.tezosBakerRating ), now it's used also in bakerAddress's setter to update tezosBakerFee
   * propery, thats why this flag was introduced )
   */
  private getTezosBakerInfos(address, updateFee = false) {
    this.bakingService
      .getTezosBakerInfos(address)
      .then(result => {
        if (result.status === 'success' && result.rating && result.fee && result.baker_name) {
          this.tezosBakerRating = (Math.round((Number(result.rating) + 0.00001) * 100) / 100).toString() + ' %'
          this.tezosBakerFee = updateFee ? result.fee + ' %' : this.tezosBakerFee
          this.tezosBakerName = result.baker_name
          this.tezosBakerAvailableCap = result.available_capacity
          this.myTBUrl = result.myTB
          this.tezosBakerAcceptingDelegation = result.accepting_delegation
          this.tezosBakerNominalStakingYield = result.nominal_staking_yield
        } else {
          this.tezosBakerRating = 'not available'
          this.tezosBakerFee = updateFee ? 'not available' : this.tezosBakerFee
        }
        this.bakerTableRatings = {
          ...this.bakerTableRatings,
          tezosBakerRating: this.tezosBakerRating
        }
      })
      .catch(error => {
        this.isValidBaker = false
      })
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
    const initialState = { qrdata: this.address, size: 200 }
    const modalRef = this.modalService.show(QrModalComponent, { initialState })
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
}
