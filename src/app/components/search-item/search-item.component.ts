import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Observable, race } from 'rxjs'
import { debounceTime, switchMap, take, map, filter } from 'rxjs/operators'
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead'
import { FormControl } from '@angular/forms'

import { BaseComponent } from '../base.component'
import { ApiService } from '@tezblock/services/api/api.service'
import { TypeAheadObject } from '@tezblock/interfaces/TypeAheadObject'
import { SearchService } from 'src/app/services/search/search.service'

const toPreviousOption = value => ({ name: value, type: 'Recent History' })

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
  get dataSourceSnapshot(): any[] {
    return this._dataSourceSnapshot || []
  }
  set dataSourceSnapshot(value: any[]) {
    this._dataSourceSnapshot = value
  }
  private _dataSourceSnapshot: any[]
  private isValueChangedBySelect = false

  constructor(private readonly apiService: ApiService, private readonly searchService: SearchService) {
    super()
  }

  ngOnInit() {
    const initialSearchGreaterThanOneCharacter = value => (this._dataSourceSnapshot ? true : value && value.length > 1)
    const takeFromArray = (count: number) => (data: any[]) => data.slice(0, count)

    this.searchControl = new FormControl('')

    this.dataSource$ = this.searchControl.valueChanges.pipe(
      debounceTime(500), // breaks typeahead somehow ... :/, thats why dataEmitter is introduced (handy for previous feature)
      filter(initialSearchGreaterThanOneCharacter),
      filter(this.skipValueSetBySelects.bind(this)),
      switchMap(token =>
        race([
          this.apiService.getTransactionHashesStartingWith(token),
          this.apiService.getAccountsStartingWith(token),
          this.apiService.getBlockHashesStartingWith(token)
        ])
      )
    )

    this.dataSource$
      .pipe(
        map(takeFromArray(5)),
        switchMap(data =>
          this.searchService.getPreviousSearches().pipe(
            map(previousSearches => {
              const value = this.searchControl.value ? this.searchControl.value.toLowerCase() : null
              const matches = previousSearches
                .filter(previousItem => (value ? previousItem.toLowerCase().indexOf(value) !== -1 : false))
                .filter(previousItem => !data.some(dataItem => dataItem.name === previousItem))
                .map(toPreviousOption)

              return data.concat(matches)
            })
          )
        )
      )
      .subscribe(data => {
        this.dataEmitter.emit(data)
        this.dataSourceSnapshot = data || []
      })
  }

  onKeyEnter() {
    this.subscriptions.push(
      this.dataSource$.subscribe((val: TypeAheadObject[]) => {
        if (val.length > 0 && val[0].name !== this.searchControl.value) {
          // there are typeahead suggestions. upon hitting enter, we first autocomplete the suggestion
          return
        } else {
          this.search(this.searchControl.value)
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
          .map(toPreviousOption)

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
