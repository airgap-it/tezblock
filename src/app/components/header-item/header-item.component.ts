import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { TranslateService } from '@ngx-translate/core'
import { Observable, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

import * as fromRoot from '@tezblock/reducers'
import { ThemeService } from '@tezblock/services/theme/theme.service'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { LanguagesService } from '@tezblock/services/translation/languages.service'
import { TezosNetwork } from '@airgap/coinlib-core'

@Component({
  selector: 'header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss']
})
export class HeaderItemComponent implements OnInit {
  @Input()
  isMinimized: boolean = false

  @Input()
  activeLinkBlockchain: boolean = false

  @Input()
  activeLinkResources: boolean = false

  @Input()
  activeLinkAssets: boolean = false

  subscription: Subscription

  currentCycle$: Observable<number>
  cycleProgress$: Observable<number>
  remainingTime$: Observable<string>
  triggers: string = ''
  title = 'tezblock'
  triggers$: Observable<string>
  isCollapsed = true
  hideDropdown = true
  selectedNetwork: TezosNetwork
  networks = TezosNetwork

  constructor(
    private readonly router: Router,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly store$: Store<fromRoot.State>,
    public readonly themeService: ThemeService,
    public translate: TranslateService,
    private readonly languagesService: LanguagesService
  ) { }

  ngOnInit() {
    this.currentCycle$ = this.store$.select(fromRoot.app.currentCycle)
    this.cycleProgress$ = this.store$.select(fromRoot.app.cycleProgress)
    this.remainingTime$ = this.store$.select(fromRoot.app.remainingTime)
    this.selectedNetwork = this.chainNetworkService.getNetwork()
    this.triggers$ = this.breakpointObserver
      .observe([Breakpoints.HandsetLandscape, Breakpoints.HandsetPortrait])
      .pipe(map((breakpointState) => (breakpointState.matches ? '' : 'hover')))
  }

  navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  changeNetwork(name: TezosNetwork) {
    this.chainNetworkService.changeEnvironment(name)
  }

  changeTheme() {
    this.themeService.switch()
  }

  changeLanguage(language: string) {
    this.languagesService.loadLanguages(language)
  }
}
