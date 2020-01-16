import { Component, Input, OnInit, TrackByFunction } from '@angular/core'
import { FormControl } from '@angular/forms'
import { PageChangedEvent } from 'ngx-bootstrap/pagination'

import { Pagination } from '@tezblock/services/facade/facade'
import { Column } from '@tezblock/components/tezblock-table2/tezblock-table2.component'

@Component({
  selector: 'app-client-side-table',
  templateUrl: './client-side-table.component.html',
  styleUrls: ['./client-side-table.component.scss']
})
export class ClientSideTableComponent implements OnInit {
  @Input() data: any[]

  @Input() columns: Column[]

  @Input() filterCondition: (item: any, query: string) => boolean

  pagedData: any[]
  pagination: Pagination
  filterTerm: FormControl

  constructor() {}

  ngOnInit() {
    this.filterTerm = new FormControl('')
    this.pagedData = this.data.slice(0, 10)
    this.pagination = {
      selectedSize: undefined,
      currentPage: 1,
      pageSizes: undefined,
      total: this.data.length
    }
  }

  pageChanged(event: PageChangedEvent) {
    const startItem = (event.page - 1) * event.itemsPerPage
    const endItem = event.page * event.itemsPerPage

    // QUESTION: should I take under account filtering here ?
    this.pagedData = this.data.slice(startItem, endItem)
    this.pagination = {
      selectedSize: undefined,
      currentPage: event.page,
      pageSizes: undefined,
      total: this.data.length
    }
  }

  filter() {
    const filteredData = this.filterTerm.value ? this.data.filter(item => this.filterCondition(item, this.filterTerm.value)) : this.data

    this.pagedData = filteredData.slice(0, 10)
    this.pagination = {
      selectedSize: undefined,
      currentPage: 1,
      pageSizes: undefined,
      total: filteredData.length
    }
  }
}
