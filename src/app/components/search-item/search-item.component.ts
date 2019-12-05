import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { switchMap, take } from 'rxjs/operators'
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead'

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

  searchTerm: string
  dataSource$: Observable<any>
  readonly typeaheadOptionsLimit = 7

  constructor(private readonly apiService: ApiService, private readonly searchService: SearchService) {
    super()
  }

  ngOnInit() {
    this.dataSource$ = new Observable<string>((observer: any) => {
      observer.next(this.searchTerm)
    }).pipe(
      switchMap(token => {
        const response = new Subject<Object[]>()
        let data = []
        const updateResponse = (apiResult: Object[]) => {
          data = data.concat(apiResult)
          response.next(data.slice(0, this.typeaheadOptionsLimit))
        }

        ;[
          this.apiService.getTransactionHashesStartingWith(token),
          this.apiService.getAccountsStartingWith(token),
          this.apiService.getBlockHashesStartingWith(token)
        ].forEach(api => api.pipe(take(1)).subscribe(updateResponse))

        return response
      })
    )
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
    const value = searchTerm || this.searchTerm

    this.onSearch.emit(value)
    this.searchService.search(value).subscribe(succeeded => {
      if (succeeded) {
        this.searchTerm = null
      }
    })
  }

  onSelect(e: TypeaheadMatch) {
    this.search(e.value)
  }
}
