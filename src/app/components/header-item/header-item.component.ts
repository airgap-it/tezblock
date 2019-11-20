import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, Subscription } from 'rxjs'
import { ChainNetworkService } from 'src/app/services/chain-network/chain-network.service'
import { CycleService } from 'src/app/services/cycle/cycle.service'

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

  public subscription: Subscription

  public currentCycle: Observable<number>
  public cycleProgress: Observable<number>
  public remainingTime: Observable<string>

  public title = 'tezblock'
  public isCollapsed = true
  public showDropdown = false
  public selectedNetwork: string

  constructor(
    private readonly router: Router,
    private readonly cycleService: CycleService,
    private readonly chainNetworkService: ChainNetworkService
  ) {
    this.currentCycle = this.cycleService.currentCycle$
    this.cycleProgress = this.cycleService.cycleProgress$
    this.remainingTime = this.cycleService.remainingTime$
    this.selectedNetwork = this.chainNetworkService.getEnvironmentVariable()
  }

  public navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  public changeNetwork(name: string) {
    this.selectedNetwork = name
  }
}
