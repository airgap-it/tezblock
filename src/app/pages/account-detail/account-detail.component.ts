import { RightsSingleService } from './../../services/rights-single/rights-single.service'
import { TelegramModalComponent } from './../../components/telegram-modal/telegram-modal.component'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BsModalService } from 'ngx-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { Observable, Subscription, combineLatest } from 'rxjs'

import { QrModalComponent } from '../../components/qr-modal/qr-modal.component'
import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Account } from '../../interfaces/Account'
import { AliasPipe } from '../../pipes/alias/alias.pipe'
import { AccountSingleService } from '../../services/account-single/account-single.service'
import { AccountService } from '../../services/account/account.service'
import { BakingService } from '../../services/baking/baking.service'
import { CopyService } from '../../services/copy/copy.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { TransactionSingleService } from '../../services/transaction-single/transaction-single.service'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { Transaction } from 'src/app/interfaces/Transaction'
import { TezosRewards } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
  providers: [AccountSingleService, TransactionSingleService, RightsSingleService],

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
export class AccountDetailComponent implements OnInit, OnDestroy {
  public account$: Observable<Account> = new Observable()
  public delegatedAccounts: Observable<Account[]> = new Observable()
  public delegatedAccountAddress: string | undefined
  public relatedAccounts: Observable<Account[]> = new Observable()
  public delegatedAmount: number | undefined

  public get bakerAddress(): string | undefined {
    return this._bakerAddress
  }
  public set bakerAddress(value: string | undefined) {
    if (value !== this._bakerAddress) {
      this._bakerAddress = value
      this.getTezosBakerInfos(value, true)
    }
  }
  private _bakerAddress: string | undefined

  public bakingBadRating: string | undefined
  public tezosBakerRating: string | undefined
  public stakingBalance: number | undefined
  public bakingInfos: any
  public bakerTableInfos: any
  public bakerTableRatings: any = {}

  public tezosBakerFee: string | undefined
  public stakingCapacity: number | undefined
  public stakingProgress: number | undefined
  public stakingBond: number | undefined

  public isValidBaker: boolean | undefined
  public revealed: string | undefined
  public hasAlias: boolean | undefined
  public hasLogo: boolean | undefined

  public transactions$: Observable<Transaction[]> = new Observable()

  public tezosBakerName: string | undefined
  public tezosBakerAvailableCap: string | undefined
  public tezosBakerAcceptingDelegation: string | undefined
  public tezosBakerNominalStakingYield: string | undefined

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public transactionsLoading$: Observable<boolean>
  public paginationLimit: number = 2
  public numberOfInitialRelatedAccounts: number = 2

  public isCollapsed: boolean = true

  public rewards: TezosRewards
  public rights$: Observable<Object> = new Observable()

  private readonly subscriptions: Subscription = new Subscription()
  public current: string = 'copyGrey'

  public tabs: Tab[] = [
    { title: 'Transactions', active: true, kind: 'transaction', count: 0, icon: this.iconPipe.transform('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: 0, icon: this.iconPipe.transform('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: 0, icon: this.iconPipe.transform('link') },
    { title: 'Endorsements', active: false, kind: 'endorsement', count: 0, icon: this.iconPipe.transform('stamp') },
    { title: 'Votes', active: false, kind: 'ballot', count: 0, icon: this.iconPipe.transform('boxBallot') }
  ]
  public bakerTabs: Tab[] = [
    { title: 'Baker Overview', active: true, kind: 'baker_overview', count: 0, icon: this.iconPipe.transform('hatChef') },
    { title: 'Baking Rights', active: false, kind: 'baking_rights', count: 0, icon: this.iconPipe.transform('breadLoaf') },
    { title: 'Endorsing Rights', active: false, kind: 'endorsing_rights', count: 0, icon: this.iconPipe.transform('stamp') },
    { title: 'Rewards', active: false, kind: 'rewards', count: 0, icon: this.iconPipe.transform('coin') }
  ]
  public nextPayout: Date | undefined
  public rewardAmount: number | undefined
  public myTBUrl: string | undefined
  public get address(): string {
    return this.route.snapshot.params.id
  }
  public frozenBalance: number | undefined
  public rewardsTransaction: any

  constructor(
    public readonly transactionSingleService: TransactionSingleService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountService: AccountService,
    private readonly bakingService: BakingService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly modalService: BsModalService,
    private readonly copyService: CopyService,
    private readonly aliasPipe: AliasPipe,
    private readonly toastrService: ToastrService,
    private readonly iconPipe: IconPipe,
    private readonly accountSingleService: AccountSingleService,
    private readonly rightsSingleService: RightsSingleService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false
    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$

    this.getBakingInfos(this.address)

    this.subscriptions.add(
      combineLatest([this.accountSingleService.address$, this.accountSingleService.delegatedAccounts$]).subscribe(
        ([address, delegatedAccounts]: [string, Account[]]) => {
          if (!delegatedAccounts) {
            this.delegatedAccountAddress = undefined
          } else if (delegatedAccounts.length > 0) {
            this.delegatedAccountAddress = delegatedAccounts[0].account_id
            this.bakerAddress = delegatedAccounts[0].delegate_value

            this.delegatedAmount = delegatedAccounts[0].balance
          } else {
            this.delegatedAccountAddress = ''
          }
        }
      )
    )
    this.relatedAccounts = this.accountSingleService.relatedAccounts$
    this.transactionsLoading$ = this.transactionSingleService.loading$
  }

  public async ngOnInit() {
    const address: string = this.route.snapshot.params.id
    this.rightsSingleService.updateAddress(address)

    if (accounts.hasOwnProperty(address) && !!this.aliasPipe.transform(address)) {
      this.hasAlias = true
      this.hasLogo = accounts[address].hasLogo
    }
    this.transactions$ = this.transactionSingleService.transactions$

    this.rights$ = this.rightsSingleService.rights$

    this.transactionSingleService.updateAddress(address)

    this.accountSingleService.setAddress(address)

    this.account$ = this.accountSingleService.account$

    this.revealed = await this.accountService.getAccountStatus(address)
  }

  public async getBakingInfos(address: string) {
    this.bakingService
      .getBakerInfos(address)
      .then(async result => {
        this.isValidBaker = true

        if (result) {
          this.bakerTableInfos = {
            stakingBalance: result.stakingBalance,
            numberOfRolls: Math.floor(result.stakingBalance / (8000 * 1000000)),
            stakingCapacity: result.stakingCapacity,
            stakingProgress: Math.min(100, result.stakingProgress),
            stakingBond: result.selfBond,
            frozenBalance: await this.accountService.getFrozen(address)
          }
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

        this.bakerTableRatings.bakingBadRating = this.bakingBadRating
      })
      .catch(error => {
        this.isValidBaker = false
      })

    this.getTezosBakerInfos(this.address)
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
        this.bakerTableRatings.tezosBakerRating = this.tezosBakerRating
      })
      .catch(error => {
        this.isValidBaker = false
      })
  }

  public tabSelected(tab: string) {
    this.transactionSingleService.updateKind(tab)
  }

  public upperTabSelected(tab: string) {
    this.rightsSingleService.updateKind(tab)
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public showQr() {
    const initialState = { qrdata: this.route.snapshot.params.id, size: 200 }
    const modalRef = this.modalService.show(QrModalComponent, { initialState })
    modalRef.content.closeBtnName = 'Close'
  }

  public showTelegramModal() {
    const initialState = {
      botAddress: this.route.snapshot.params.id,
      botName: this.aliasPipe.transform(this.route.snapshot.params.id)
    }
    const modalRef = this.modalService.show(TelegramModalComponent, { initialState })
    modalRef.content.closeBtnName = 'Close'
  }

  public showMoreItems() {
    this.paginationLimit = this.paginationLimit + 50 // TODO: set dynamic number
  }
  public showLessItems() {
    this.paginationLimit = this.paginationLimit - 50 // TODO: set dynamic number
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
  public replaceAll(string: string, find: string, replace: string) {
    return string.replace(new RegExp(find, 'g'), replace)
  }
  public changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey'
    setTimeout(() => {
      this.current = 'copyGrey'
    }, 1500)
    this.toastrService.success('has been copied to clipboard', address)
  }

  public loadMore(): void {
    this.transactionSingleService.loadMore()
  }
}
