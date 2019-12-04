import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Observable, race } from 'rxjs'
import { debounceTime, switchMap, take, map, filter } from 'rxjs/operators'
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead'
import { FormControl } from '@angular/forms'

import { BaseComponent } from '../base.component'
import { ApiService } from '@tezblock/services/api/api.service'
import { TypeAheadObject } from '@tezblock/interfaces/TypeAheadObject'
import { SearchService } from 'src/app/services/search/search.service'

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent extends BaseComponent implements OnInit {
  @Output() onSearch = new EventEmitter<string>()
  @Input() buttonLabel: string

  // ngx-bootstrap is weak, so walkaround: https://stackoverflow.com/questions/50840415/typeahead-on-reactive-forms-typeahead-doesnt-show-up
  dataEmitter: EventEmitter<any[]> = new EventEmitter<any[]>()
  searchControl: FormControl
  dataSource$: Observable<any>
  dataSourceSnapshot = []
  private isValueChangedBySelect = false

  constructor(private readonly apiService: ApiService, private readonly searchService: SearchService) {
    super()
  }

  ngOnInit() {
    this.searchControl = new FormControl('')

    this.dataSource$ = this.searchControl.valueChanges.pipe(
      debounceTime(500),
      filter(this.skipValueSetBySelects.bind(this)),
      switchMap(token =>
        race([
          this.apiService.getTransactionHashesStartingWith(token),
          this.apiService.getAccountsStartingWith(token),
          this.apiService.getBlockHashesStartingWith(token)
        ])
      )
    )

    this.dataSource$.pipe(map((data: any[]) => data.slice(0, 5))).subscribe(data => {
      this.dataEmitter.emit(data)
      this.dataSourceSnapshot = data || []
    })
  }

  onKeyEnter(searchTerm: string) {
    this.subscriptions.push(
      this.dataSource$.subscribe((val: TypeAheadObject[]) => {
        if (val.length > 0 && val[0].name !== searchTerm) {
          // there are typeahead suggestions. upon hitting enter, we first autocomplete the suggestion
          return
        } else {
          this.search(searchTerm)
        }
      })
    )
  }

  search(searchTerm?: string) {
    const value = searchTerm || this.searchControl.value

    this.onSearch.emit(value)
    this.searchService.search(value).subscribe(succeeded => {
      if (succeeded) {
        this.isValueChangedBySelect = true
        this.searchControl.setValue('')
      }
    })
  }

  onSelect(e: TypeaheadMatch) {
    this.search(e.value)
    this.searchService.updatePreviousSearches(e.value)
  }

  onMouseDown() {
    const optionToName = option => option.name

    this.searchService
      .getPreviousSearches()
      .pipe(take(1))
      .subscribe(previousSearches => {
        const previousSearchesOptions = previousSearches
          .filter(previousSearche => this.dataSourceSnapshot.map(optionToName).indexOf(previousSearche) === -1)
          .map(previousSearche => ({
            name: previousSearche,
            type: 'Previous'
          }))

        this.dataEmitter.emit(this.dataSourceSnapshot.concat(previousSearchesOptions))
      })
  }

  private skipValueSetBySelects() {
    if (this.isValueChangedBySelect) {
      this.isValueChangedBySelect = false

      return false
    }

    return true
  }
}
