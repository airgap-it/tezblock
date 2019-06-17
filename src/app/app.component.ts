import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { CycleService } from './services/cycle/cycle.service'
import { SearchService } from './services/search/search.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public searchTerm: string = ''

  public currentCycle$: Observable<number>

  public cycleProgress$: Observable<number>
  public remainingTime$: Observable<string>

  public title = 'tezblock'
  public isCollapsed = true
  public url: string = ''

  constructor(
    public readonly router: Router,

    public readonly searchService: SearchService,
    private readonly cycleService: CycleService
  ) {
    this.currentCycle$ = this.cycleService.currentCycle$
    this.cycleProgress$ = this.cycleService.cycleProgress$

    this.remainingTime$ = this.cycleService.remainingTime$
    this.url = this.router.url
  }

  public navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }
}
