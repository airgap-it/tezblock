import { Component, Input, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core'
import { FormControl } from '@angular/forms'
import { PageChangedEvent } from 'ngx-bootstrap/pagination'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { filter, map, pairwise, switchMap } from 'rxjs/operators'
import { isNil, negate } from 'lodash'

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

  // Upon subscription BehaviorSubject returns the last value of the subject. A regular observable only triggers when it receives an onnext
  pagination$ = new BehaviorSubject<Pagination>(undefined)
  filterTerm: FormControl
  filter$ = new BehaviorSubject<string>(undefined)

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
    super()
  }

  ngOnInit() {
    this.filterTerm = new FormControl('')

    const foo$ = combineLatest(
      this.pagination$.pipe(
        pairwise(),
        filter(([previous, current]) => get<Pagination>(p => p.currentPage)(previous) !== get<Pagination>(p => p.currentPage)(current)),
        map(([previous, current]) => current)
      ),
      this.filter$
    )

    // const foo1$ = combineLatest(
    //   this.pagination$.pipe(
    //     pairwise(),
    //     filter(([previous, current]) => {
    //       const a = get<Pagination>(p => p.currentPage)(previous)
    //       const b = get<Pagination>(p => p.currentPage)(current)

    //       return a !== b
    //     }),
    //     map(([previous, current]) => current)
    //   ),
    //   this.filter$
    // )

    const foo2$ = combineLatest(this.pagination$.pipe(filter(negate(isNil))), this.filter$)

    this.data$ =
      // foo2$: triggers 2 times (looks like subscribers increased this number ...) ... : /
      foo2$.pipe(
        switchMap(([pagination, filter]) => {
          return this.dataSource.get(pagination, filter)
        })
      )

    foo2$.subscribe(x => {
      console.log(`>>> foo2$: ${x}`)
    })

    foo$.subscribe(x => {
      console.log(`>>> foo$: ${x}`)
    })

    // this.pagination$.subscribe(x => {
    //   console.log(`>>> pagination$: ${x}`)
    //   // this.changeDetectorRef.markForCheck()
    // })

    // this.pagination$.pipe(
    //   pairwise(),
    //   filter(([previous, current]) => get<Pagination>(p => p.currentPage)(previous) !== get<Pagination>(p => p.currentPage)(current)),
    //   map(([previous, current]) => current)
    // ).subscribe(x => {
    //   console.log(`>>> pagination$.pipe(...): ${x}`)
    // })

    //this.pagination$.next(null)
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
      total: this.pagination$.value.total
    })
  }

  filter() {
    const filter = this.filterTerm.value

    this.filter$.next(filter)

    this.subscriptions.push(
      this.dataSource.getTotal(filter).subscribe(total => {
        this.pagination$.next({
          ...this.pagination$.value,
          total
        })
      })
    )
  }
}
