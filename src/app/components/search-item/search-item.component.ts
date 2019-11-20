import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { forkJoin, Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'

import { BaseComponent } from '../base.component'
import { ApiService } from '@tezblock/services/api/api.service'
import { TypeAheadObject } from '@tezblock/interfaces/TypeAheadObject'

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent extends BaseComponent implements OnInit {
  @Input() buttonLabel: string;
  @Output() onSearch = new EventEmitter<string>()

  public dataSource$: Observable<any>
  public searchTerm: string = ''

  constructor(private readonly apiService: ApiService) {
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

  public onKeyEnter(searchTerm: string) {
    this.subscriptions.push(
      this.dataSource$.subscribe((val: TypeAheadObject[]) => {
        if (val.length > 0 && val[0].name !== searchTerm) {
          // there are typeahead suggestions. upon hitting enter, we first autocomplete the suggestion
          return
        } else {
          this.onSearch.emit(searchTerm)
        }
      })
    )
  }

  search() {
    this.onSearch.emit(this.searchTerm)
  }
}
