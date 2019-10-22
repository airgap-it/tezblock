import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BakerInfo } from 'airgap-coin-lib'
import { Observable, Subscription } from 'rxjs'
import { Account } from '../interfaces/Account'
import { AccountSingleService } from '../services/account-single/account-single.service'
import { AccountService } from '../services/account/account.service'
import { ApiService } from '../services/api/api.service'
import { BakingService } from '../services/baking/baking.service'
import { CryptoPricesService, CurrencyInfo } from '../services/crypto-prices/crypto-prices.service'
import { TransactionSingleService } from '../services/transaction-single/transaction-single.service'

import { AliasPipe } from '../pipes/alias/alias.pipe'

const accounts = require('../../assets/bakers/json/accounts.json')

export interface Tab {
  title: string
  active: boolean
  kind: string
  icon?: string[]
}

@Component({
  selector: 'rewards-table',
  templateUrl: './rewards-table.component.html',
  styleUrls: ['./rewards-table.component.scss']
})
export class RewardsTableComponent implements OnInit {
  private _tabs: Tab[] | undefined = []
  public selectedTab: Tab | undefined = undefined

  public bakingBadRating: string | undefined
  public tezosBakerRating: string | undefined
  public stakingBalance: number | undefined
  public bakingInfos: any
  public stakingCapacity: number | undefined
  public stakingProgress: number | undefined
  public stakingBond: number | undefined

  public isValidBaker: boolean | undefined

  public accountSingleService: AccountSingleService

  private readonly subscriptions: Subscription = new Subscription()

  public myTBUrl: string | undefined
  public address: string
  public frozenBalance: number | undefined

  @Input()
  set tabs(tabs: Tab[]) {
    this._tabs = tabs
    if (!this.selectedTab) {
      this.selectedTab = tabs[0]
    }
  }

  get tabs() {
    if (this._tabs) {
      return this._tabs
    } else {
      return []
    }
  }

  @Input()
  public page: string = 'account'

  @Output()
  public readonly tabClicked: EventEmitter<string> = new EventEmitter()

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountService: AccountService,
    private readonly bakingService: BakingService,
    private readonly cryptoPricesService: CryptoPricesService,

    private readonly apiService: ApiService,
    private readonly aliasPipe: AliasPipe
  ) {
    this.address = this.route.snapshot.params.id
    this.router.routeReuseStrategy.shouldReuseRoute = () => false

    this.accountSingleService = new AccountSingleService(this.apiService)

    this.subscriptions.add(
      this.accountSingleService.delegatedAccounts$.subscribe((delegatedAccounts: Account[]) => {
        if (delegatedAccounts.length > 0) {
          this.getBakingInfos(this.address)
        }
      })
    )
  }

  public async ngOnInit() {
    const address: string = this.route.snapshot.params.id

    this.accountSingleService.setAddress(address)

    this.frozenBalance = await this.accountService.getFrozen(address)
  }

  public async getBakingInfos(address: string) {
    this.bakingInfos = await this.bakingService.getBakerInfos(address)
    this.stakingBalance = this.bakingInfos.stakingBalance
    this.stakingCapacity = this.bakingInfos.stakingCapacity
    this.stakingProgress = Math.min(100, this.bakingInfos.stakingProgress)
    this.stakingBond = this.bakingInfos.selfBond
    this.isValidBaker = true

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
          this.myTBUrl = result.myTB
        } else {
          this.tezosBakerRating = 'not available'
        }
      })
      .catch(error => {
        this.isValidBaker = false
      })
  }

  public selectTab(selectedTab: Tab) {
    this.tabs.forEach(tab => (tab.active = false))
    selectedTab.active = true
    this.selectedTab = selectedTab

    this.tabClicked.emit(selectedTab.kind)
  }
  public goToMYTB() {
    if (this.myTBUrl) {
      window.open(this.myTBUrl, '_blank')
    }
  }
}
