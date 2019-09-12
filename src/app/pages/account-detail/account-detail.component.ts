import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BakerInfo } from 'airgap-coin-lib'
import { BsModalService } from 'ngx-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { Observable, Subscription } from 'rxjs'

import { QrModalComponent } from '../../components/qr-modal/qr-modal.component'
import { Tab } from '../../components/tabbed-table/tabbed-table.component'
import { Account } from '../../interfaces/Account'
import { AliasPipe } from '../../pipes/alias/alias.pipe'
import { AccountSingleService } from '../../services/account-single/account-single.service'
import { AccountService } from '../../services/account/account.service'
import { ApiService } from '../../services/api/api.service'
import { BakingService } from '../../services/baking/baking.service'
import { CopyService } from '../../services/copy/copy.service'
import { CryptoPricesService, CurrencyInfo } from '../../services/crypto-prices/crypto-prices.service'
import { TransactionSingleService } from '../../services/transaction-single/transaction-single.service'
import { IconService, IconRef } from '../../services/icon/icon.service'

const accounts = require('../../../assets/bakers/json/accounts.json')

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],

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
  public bakerInfo: BakerInfo | undefined

  public account$: Observable<Account> = new Observable()
  public delegatedAccounts: Observable<Account[]> = new Observable()
  public delegatedAccountAddress: string | undefined
  public relatedAccounts: Observable<Account[]> = new Observable()
  public bakerAddress: string | undefined
  public delegatedAmount: number | undefined

  public bakingBadRating: string | undefined
  public tezosBakerRating: string | undefined
  public stakingBalance: number | undefined
  public bakingInfos: any
  public tezosBakerFee: string | undefined
  public stakingCapacity: number | undefined
  public stakingProgress: number | undefined
  public stakingBond: number | undefined

  public isValidBaker: boolean | undefined
  public revealed: string | undefined
  public hasAlias: boolean | undefined
  public hasLogo: boolean | undefined

  public transactions$: Observable<Object> = new Observable()
  public tezosBakerName: string | undefined
  public tezosBakerAvailableCap: string | undefined
  public tezosBakerAcceptingDelegation: string | undefined
  public tezosBakerNominalStakingYield: string | undefined

  public fiatCurrencyInfo$: Observable<CurrencyInfo>

  public transactionsLoading$: Observable<boolean>
  public paginationLimit: number = 2
  public numberOfInitialRelatedAccounts: number = 2

  public accountSingleService: AccountSingleService

  public isCollapsed: boolean = true

  private readonly subscriptions: Subscription = new Subscription()
  public current: string = 'copyGrey'

  public transactionSingleService: TransactionSingleService
  public tabs: Tab[] = [
    { title: 'Transactions', active: true, kind: 'transaction', count: 0, icon: this.iconService.iconProperties('exchangeAlt') },
    { title: 'Delegations', active: false, kind: 'delegation', count: 0, icon: this.iconService.iconProperties('handReceiving') },
    { title: 'Originations', active: false, kind: 'origination', count: 0, icon: this.iconService.iconProperties('link') },
    { title: 'Endorsements', active: false, kind: 'endorsement', count: 0, icon: this.iconService.iconProperties('stamp') },
    { title: 'Vote', active: false, kind: 'ballot', count: 0, icon: this.iconService.iconProperties('boxBallot') }
  ]
  public nextPayout: Date | undefined
  public rewardAmount: number | undefined
  public myTBUrl: string | undefined
  public address: string

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountService: AccountService,
    private readonly bakingService: BakingService,
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly modalService: BsModalService,
    private readonly copyService: CopyService,
    private readonly apiService: ApiService,
    private readonly aliasPipe: AliasPipe,
    private readonly toastrService: ToastrService,
    private readonly iconService: IconService
  ) {
    this.address = this.route.snapshot.params.id
    this.transactionSingleService = new TransactionSingleService(this.apiService)
    this.router.routeReuseStrategy.shouldReuseRoute = () => false

    this.fiatCurrencyInfo$ = this.cryptoPricesService.fiatCurrencyInfo$

    this.accountSingleService = new AccountSingleService(this.apiService)

    this.subscriptions.add(
      this.accountSingleService.delegatedAccounts$.subscribe((delegatedAccounts: Account[]) => {
        if (delegatedAccounts.length > 0) {
          this.delegatedAccountAddress = delegatedAccounts[0].account_id
          this.bakerAddress = delegatedAccounts[0].delegate_value

          this.getBakingInfos(this.address)

          this.delegatedAmount = delegatedAccounts[0].balance
        }
      })
    )
    this.relatedAccounts = this.accountSingleService.originatedAccounts$
    this.transactionsLoading$ = this.transactionSingleService.loading$
  }

  public async ngOnInit() {
    const address: string = this.route.snapshot.params.id

    if (accounts.hasOwnProperty(address) && !!this.aliasPipe.transform(address)) {
      this.hasAlias = true
      this.hasLogo = accounts[address].hasLogo
    }

    this.transactions$ = this.transactionSingleService.transactions$

    this.transactionSingleService.updateAddress(address)

    this.accountSingleService.setAddress(address)

    this.account$ = this.accountSingleService.account$

    this.revealed = await this.accountService.getAccountStatus(address)
  }

  public async getBakingInfos(address: string) {
    if (address.startsWith('KT') || !this.isValidBaker) {
      this.tezosBakerFee = 'not available'
    }
    this.bakingInfos = await this.bakingService.getBakerInfos(address)
    this.stakingBalance = this.bakingInfos.stakingBalance
    this.stakingCapacity = this.bakingInfos.stakingCapacity
    this.stakingProgress = Math.min(100, this.bakingInfos.stakingProgress)
    this.stakingBond = this.bakingInfos.selfBond
    this.isValidBaker = true
    //this.nextPayout = this.bakingInfos.nextPayout
    //this.rewardAmount = this.bakingInfos.avgRoI.dividedBy(1000000).toNumber()

    // TODO: Move to component

    this.bakingService
      .getBakingBadRatings(address)
      .then(result => {
        if (result.rating === 0 && result.status === 'success') {
          console.log('awesome')
          this.bakingBadRating = 'awesome'
        } else if (result.rating === 1 && result.status === 'success') {
          console.log('so-so')
          this.bakingBadRating = 'so-so'
        } else if (result.rating === 2 && result.status === 'success') {
          console.log('dead')
          this.bakingBadRating = 'dead'
        } else if (result.rating === 3 && result.status === 'success') {
          console.log('specific')
          this.bakingBadRating = 'specific'
        } else if (result.rating === 4 && result.status === 'success') {
          console.log('hidden')
          this.bakingBadRating = 'hidden'
        } else if (result.rating === 5 && result.status === 'success') {
          console.log('new')
          this.bakingBadRating = 'new'
        } else if (result.rating === 6 && result.status === 'success') {
          console.log('closed')
          this.bakingBadRating = 'closed'
        } else if (result.rating === 9 && result.status === 'success') {
          console.log('unkown')
          this.bakingBadRating = 'unknown'
        } else {
          console.log('not available')
          this.bakingBadRating = 'not available'
        }
      })
      .catch(error => {
        this.isValidBaker = false
      })

    // TODO: Move to component
    await this.bakingService
      .getTezosBakerInfos(address)
      .then(result => {
        if (result.status === 'success' && result.rating && result.fee && result.baker_name) {
          this.tezosBakerRating = (Math.round((Number(result.rating) + 0.00001) * 100) / 100).toString() + ' %'
          this.tezosBakerFee = result.fee + ' %'
          this.tezosBakerName = result.baker_name
          this.tezosBakerAvailableCap = result.available_capacity
          this.myTBUrl = result.myTB
          this.tezosBakerAcceptingDelegation = result.accepting_delegation
          this.tezosBakerNominalStakingYield = result.nominal_staking_yield
        } else {
          this.tezosBakerRating = 'not available'
          this.tezosBakerFee = 'not available'
        }
      })
      .catch(error => {
        this.isValidBaker = false
      })
  }

  public tabSelected(tab: string) {
    this.transactionSingleService.updateKind(tab)
  }

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public goToMYTB() {
    if (this.myTBUrl) {
      window.open(this.myTBUrl, '_blank')
    }
  }

  public showQr() {
    const initialState = { qrdata: this.route.snapshot.params.id, size: 200 }
    const modalRef = this.modalService.show(QrModalComponent, { initialState })
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

  public icon(name: IconRef): string[] {
    return this.iconService.iconProperties(name)
  }
}
