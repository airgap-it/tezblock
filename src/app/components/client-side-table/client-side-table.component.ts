import { Component, Input, OnInit, TemplateRef } from '@angular/core'
import { FormControl } from '@angular/forms'
import { PageChangedEvent } from 'ngx-bootstrap/pagination'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

import { DataSource, Pagination } from '@tezblock/domain/table'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { BaseComponent } from '@tezblock/components/base.component'
import { get } from '@tezblock/services/fp'

@Component({
  selector: 'app-client-side-table',
  templateUrl: './client-side-table.component.html',
  styleUrls: ['./client-side-table.component.scss']
})
export class ClientSideTableComponent extends BaseComponent implements OnInit {
  @Input() dataSource: DataSource<any>

  @Input() columns: Column[]

  @Input() headerTemplate: TemplateRef<any>

  @Input() headerContext: (index: any) => Observable<any>

  data$: Observable<any[]>

  pagination$ = new BehaviorSubject<Pagination>(undefined)
  filterTerm: FormControl
  
  private filter$ = new BehaviorSubject<string>(undefined)
  private previousPagination: Pagination

  constructor() {
    super()
  }

  ngOnInit() {
    this.filterTerm = new FormControl('')

    this.data$ =
      combineLatest(
        this.pagination$.pipe(
          // this elegant approach doesn't work ( html binding seems not subscribing to data$ with this, but in code .subscribe(..) does.. )
          // pairwise(),
          // filter(([previous, current]) => get<Pagination>(p => p.currentPage)(previous) !== get<Pagination>(p => p.currentPage)(current)),
          // map(([previous, current]) => current)
          filter(pagination => {
            const result = get<Pagination>(p => p.currentPage)(pagination) !== get<Pagination>(p => p.currentPage)(this.previousPagination)
            this.previousPagination = pagination
  
            return result
          }),
        ),
        this.filter$
      ).pipe(
        switchMap(([pagination, filter]) => {
          return this.dataSource.get(pagination, filter)
        })
      )

    this.subscriptions.push(
      this.dataSource.getTotal().subscribe(total => {
        this.pagination$.next({
          selectedSize: 10,
          currentPage: 1,
          total
        })
      })
    )
  }

  pageChanged(event: PageChangedEvent) {
    this.pagination$.next({
      selectedSize: 10,
      currentPage: event.page,
      total: this.pagination$.getValue().total
    })
  }

  filter() {
    const filter = this.filterTerm.value

    this.filter$.next(filter)

    this.subscriptions.push(
      this.dataSource.getTotal(filter).subscribe(total => {
        this.pagination$.next({
          ...this.pagination$.getValue(),
          total
        })
      })
    )
  }
}
