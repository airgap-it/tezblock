import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { TranslateService } from '@ngx-translate/core'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Observable, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'

import * as fromRoot from '@tezblock/reducers'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { LanguagesService } from '@tezblock/services/translation/languages.service'

@Component({
  selector: 'header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss']
})
export class HeaderItemComponent {
  @Input()
  public isMinimized: boolean = false

  @Input()
  public activeLinkBlockchain: boolean = false

  @Input()
  public activeLinkResources: boolean = false

  @Input()
  public activeLinkAssets: boolean = false

  public subscription: Subscription

  public currentCycle$: Observable<number>
  public cycleProgress$: Observable<number>
  public remainingTime$: Observable<string>
  public triggers: string = ''
  public title = 'tezblock'
  public isCollapsed = true
  public hideDropdown = true
  public selectedNetwork: TezosNetwork
  public networks = TezosNetwork

  constructor(
    private readonly router: Router,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly store$: Store<fromRoot.State>,
    public translate: TranslateService,
    private readonly languagesService: LanguagesService
  ) {
    this.currentCycle$ = this.store$.select(fromRoot.app.currentCycle)
    this.cycleProgress$ = this.store$.select(fromRoot.app.cycleProgress)
    this.remainingTime$ = this.store$.select(fromRoot.app.remainingTime)
    this.selectedNetwork = this.chainNetworkService.getNetwork()
    this.breakpointObserver
      .observe([Breakpoints.HandsetLandscape, Breakpoints.HandsetPortrait])
      .pipe(map(breakpointState => breakpointState.matches))
      .subscribe(isMobile => {
        isMobile ? (this.triggers = '') : (this.triggers = 'hover')
      })
  }

  public navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }
  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  public changeNetwork(name: TezosNetwork) {
    this.chainNetworkService.changeEnvironment(name)
  }
  changeLanguage(language: string) {
    this.languagesService.loadLanguages(language)
  }
}
