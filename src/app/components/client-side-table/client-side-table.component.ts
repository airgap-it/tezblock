import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { DataSource, Pagination, Pageable } from '@tezblock/domain/table';
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';
import { BaseComponent } from '@tezblock/components/base.component';
import { get } from '@tezblock/services/fp';

const getFilterQueryParameterName = (key: string): string => `${key}-filter`;

@Component({
  selector: 'app-client-side-table',
  templateUrl: './client-side-table.component.html',
  styleUrls: ['./client-side-table.component.scss'],
})
export class ClientSideTableComponent extends BaseComponent implements OnInit {
  @Input() dataSource: DataSource<any>;

  @Input() columns: Column[];

  @Input() headerTemplate: TemplateRef<any>;

  @Input() headerContext: (index: any) => Observable<any>;

  @Input() key: string;

  data: any[];

  pagination$ = new BehaviorSubject<Pagination>({
    selectedSize: 10,
    currentPage: 1,
  });
  filterTerm: FormControl;
  loading = true;

  private _data$: Observable<Pageable<any>>;
  private filter$ = new BehaviorSubject<string>(undefined);
  private previousPagination: Pagination;

  private get queryParameterFilter(): string {
    return this.activatedRoute.snapshot.queryParamMap.get(
      getFilterQueryParameterName(this.key)
    );
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.setupFilter();

    // for some reason only one subscription works ... thats why I'm using data: any[], and not data$: Observable<any[]>, because async pipe doesn't work (2nd subscription)
    this._data$ = combineLatest([
      this.pagination$.pipe(
        // this elegant approach doesn't work ( html binding seems not subscribing to data$ with this, but in code .subscribe(..) does.. )
        // pairwise(),
        // filter(([previous, current]) => get<Pagination>(p => p.currentPage)(previous) !== get<Pagination>(p => p.currentPage)(current)),
        // map(([previous, current]) => current)
        filter((pagination) => {
          const result =
            get<Pagination>((p) => p.currentPage)(pagination) !==
            get<Pagination>((p) => p.currentPage)(this.previousPagination);
          this.previousPagination = pagination;

          return result;
        })
      ),
      this.filter$,
    ]).pipe(
      switchMap(([pagination, filter]) =>
        this.dataSource.get(pagination, filter)
      )
    );

    this.subscriptions.push(
      this._data$.subscribe((response) => {
        this.pagination$.next({
          ...this.pagination$.getValue(),
          total: response.total,
        });
        this.data = response.data;
        this.loading = false;
      })
    );
  }

  pageChanged(event: PageChangedEvent) {
    this.loading = true;
    this.pagination$.next({
      selectedSize: 10,
      currentPage: event.page,
      total: this.pagination$.getValue().total,
    });
  }

  filter() {
    const filter = this.filterTerm.value;
    const previousFilter = this.queryParameterFilter;

    if (filter !== previousFilter) {
      this.loading = true;

      if (this.key) {
        this.router.navigate([], {
          queryParams: { [getFilterQueryParameterName(this.key)]: filter },
        });
      }
    }

    this.filter$.next(filter);
  }

  private setupFilter() {
    const value = this.key ? this.queryParameterFilter : null;

    this.filterTerm = new FormControl(value);

    if (value) {
      this.filter();
    }
  }
}
