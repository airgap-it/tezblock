import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { forkJoin, Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
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

  constructor(private readonly apiService: ApiService, private readonly searchService: SearchService) {
    super()
  }

  ngOnInit() {
    this.dataSource$ = new Observable<string>((observer: any) => {
      observer.next(this.searchTerm)
    }).pipe(
      mergeMap(token =>
        forkJoin(
          this.apiService.getTransactionHashesStartingWith(token),
          this.apiService.getAccountsStartingWith(token),
          this.apiService.getBlockHashesStartingWith(token)
        ).pipe(map(([transactionHashes, accounts, blockHashes]) => [...transactionHashes, ...accounts, ...blockHashes]))
      )
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
