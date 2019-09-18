import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, race, Subscription } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { TypeAheadObject } from 'src/app/interfaces/TypeAheadObject'
import { CycleService } from 'src/app/services/cycle/cycle.service'
import { SearchService } from 'src/app/services/search/search.service'
import { ApiService } from './../../services/api/api.service'

@Component({
  selector: 'header-item',
  templateUrl: './header-item.component.html',
  styleUrls: ['./header-item.component.scss']
})
export class HeaderItemComponent {
  public data: Observable<any> // TODO: any
  public subscription: Subscription

  public searchTerm: string = ''
  public currentCycle: Observable<number>
  public cycleProgress: Observable<number>
  public remainingTime: Observable<string>

  public title = 'tezblock'
  public isCollapsed = true
  public showDropdown = false

  constructor(
    private readonly router: Router,
    public readonly searchService: SearchService,
    private readonly cycleService: CycleService,
    private readonly apiService: ApiService
  ) {
    this.currentCycle = this.cycleService.currentCycle$
    this.cycleProgress = this.cycleService.cycleProgress$
    this.remainingTime = this.cycleService.remainingTime$
    this.data = new Observable<any>((observer: any) => {
      observer.next(this.searchTerm)
      console.log(this.searchTerm)
    }).pipe(
      mergeMap(token =>
        race(
          // this.apiService.getTransactionHashesStartingWith(token),
          this.apiService.getAccountsStartingWith(token)
          // this.apiService.getBlockHashesStartingWith(token)
        )
      )
    )
  }

  public onKeyEnter(searchTerm: string) {
    this.subscription = this.data.subscribe((val: TypeAheadObject[]) => {
      if (val.length > 0 && val[0].name !== searchTerm) {
        // there are typeahead suggestions. upon hitting enter, we first autocomplete the suggestion
        return
      } else {
        this.searchService.search(searchTerm)
      }
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

  @Input()
  public isMinimized: boolean = false

  @Input()
  public activeLinkBlockchain: boolean = false
}
