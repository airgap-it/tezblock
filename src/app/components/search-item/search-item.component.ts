import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Observable, pipe, merge } from 'rxjs'
import { debounceTime, switchMap, take, map, filter } from 'rxjs/operators'
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead'
import { FormControl } from '@angular/forms'
import { capitalize, negate, isNil } from 'lodash'

import { BaseComponent } from '../base.component'
import { TypeAheadObject } from '@tezblock/interfaces/TypeAheadObject'
import { SearchService } from 'src/app/services/search/search.service'
import { SearchOptionData } from 'src/app/services/search/model'
import { first, flatten, get, groupBy, isNotEmptyArray } from '@tezblock/services/fp'

const toOption = (optionGroup?: string) => (value: SearchOptionData): Option => ({
  ...value,
  label: value.label || value.id,
  optionGroup: optionGroup || capitalize(value.type)
})

interface Option extends SearchOptionData {
  label: string
  optionGroup: string
}

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
  dataSource$: Observable<SearchOptionData[]>
  get dataSourceSnapshot(): Option[] {
    return this._dataSourceSnapshot || []
  }
  set dataSourceSnapshot(value: Option[]) {
    this._dataSourceSnapshot = value
  }
  private _dataSourceSnapshot: Option[]
  private isValueChangedBySelect = false

  constructor(private readonly searchService: SearchService) {
    super()
  }

  ngOnInit() {
    const initialSearchGreaterThanOneCharacter = value => (this._dataSourceSnapshot ? true : value && value.length > 1)
    const takeFromEach = (countPerType: number) => (groupedOptions: { [key: string]: SearchOptionData[] }): SearchOptionData[] =>
      flatten(Object.keys(groupedOptions).map(key => groupedOptions[key].slice(0, countPerType)))
    const narrowOptions = (countPerType: number) =>
      pipe<SearchOptionData[], { [key: string]: SearchOptionData[] }, SearchOptionData[]>(groupBy('type'), takeFromEach(countPerType))

    this.searchControl = new FormControl('')

    this.dataSource$ = this.searchControl.valueChanges.pipe(
      debounceTime(500), // breaks typeahead somehow ... :/, thats why dataEmitter is introduced (handy for previous feature)
      filter(initialSearchGreaterThanOneCharacter),
      filter(this.skipValueSetBySelects.bind(this)),
      switchMap(token => {
        let options: SearchOptionData[] = []

        return merge(...this.searchService.getSearchSources(token)).pipe(
          filter(isNotEmptyArray),
          map(partialOptions => (options = options.concat(partialOptions)))
        )
      })
    )
  
    this.dataSource$
      .pipe(
        map(narrowOptions(5)),
        switchMap(data =>
          this.searchService.getPreviousSearches().pipe(
            map(previousSearches => {
              const value = get<any>(value => value.toLowerCase())(this.searchControl.value)
              const matches = previousSearches
                .filter(previousItem => (value && previousItem.id ? previousItem.id.toLowerCase().indexOf(value) !== -1 : false))
                .filter(previousItem => !data.some(dataItem => dataItem.id === previousItem.id))
                .map(toOption('Recent History'))

              return data.map(toOption()).concat(matches)
            })
          )
        )
      )
      .subscribe(data => {
        this.dataEmitter.emit(data)
        this.dataSourceSnapshot = data || []
      })
  }

  search(option: SearchOptionData) {
    const _option: SearchOptionData = option || { id: this.searchControl.value, type: undefined }

    this.onSearch.emit(_option.id)
    this.searchService.processSearchSelection(_option)

    if (_option.type) {
      this.isValueChangedBySelect = true
      this.searchControl.setValue('')
    }
  }

  onKeyEnter() {
    this.search(undefined)
  }

  onSelect(e: TypeaheadMatch) {
    const item = e.item

    this.search(item)
    this.searchService.updatePreviousSearches(item)
  }

  // there is no point to handle search button click case ( options will apear anyways )

  onMouseDown() {
    this.searchService
      .getPreviousSearches()
      .pipe(take(1))
      .subscribe(previousSearches => {
        const previousSearchesOptions = previousSearches
          .filter(previousSearch => this.dataSourceSnapshot.every(snapshotItem => snapshotItem.id !== previousSearch.id))
          .map(toOption('Recent History'))

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
