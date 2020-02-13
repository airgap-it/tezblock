import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, TrackByFunction, ViewChild } from '@angular/core'

export enum Template {
  address,
  amount,
  basic,
  block,
  hash,
  modal,
  percentage,
  symbol,
  timestamp
}

export interface Column {
  name?: string
  field?: string
  width?: string
  data?: (item: any) => any
  template?: TemplateRef<any> | Template
  sortable?: boolean | undefined
}

export interface ExpandedRow<Entity> {
  template: TemplateRef<any>
  getContext: (entity: Entity) => any
  primaryKey: string
}

export const blockAndTxHashColumns: Column[] = [
  {
    name: 'Block',
    field: 'block_level',
    template: Template.block,
    sortable: true
  },
  {
    name: 'Tx Hash',
    field: 'operation_group_hash',
    template: Template.hash,
    data: (item: any) => ({ data: item.operation_group_hash })
  }
]

const satisfyData = (column: Column): Column =>
  column.data ? column : { ...column, data: (item: any) => ({ data: column.field ? item[column.field] : null }) }

@Component({
  selector: 'tezblock-table',
  templateUrl: './tezblock-table.component.html',
  styleUrls: ['./tezblock-table.component.scss']
})
export class TezblockTableComponent implements OnInit {
  @ViewChild('basicTemplate', { static: true }) basicTemplate: TemplateRef<any>
  @ViewChild('amountTemplate', { static: true }) amountTemplate: TemplateRef<any>
  @ViewChild('addressTemplate', { static: true }) addressTemplate: TemplateRef<any>
  @ViewChild('percentageTemplate', { static: true }) percentageTemplate: TemplateRef<any>
  @ViewChild('timestampTemplate', { static: true }) timestampTemplate: TemplateRef<any>
  @ViewChild('blockTemplate', { static: true }) blockTemplate: TemplateRef<any>
  @ViewChild('symbolTemplate', { static: true }) symbolTemplate: TemplateRef<any>
  @ViewChild('hashTemplate', { static: true }) hashTemplate: TemplateRef<any>
  @ViewChild('modalTemplate', { static: true }) modalTemplate: TemplateRef<any>

  @Input() data: any[]

  @Input() set columns(value: Column[]) {
    if (value !== this._columns) {
      this._columns = value ? value.map(satisfyData) : value
      if (this._columns.some(column => column.field === 'timestamp')) {
        this.defaultSorting = 'timestamp'
        if (this.sortingDirection.get('timestamp') === 'desc') {
          return
        } else {
          this.sorting('timestamp')
        }
      }
    }
  }
  get columns(): Column[] {
    return this._columns
  }
  private _columns: Column[]

  @Input() loading: boolean

  @Input() trackByFn?: TrackByFunction<any>

  @Input() pagination? = false

  @Input() expandedRow?: ExpandedRow<any>

  @Input()
  public downloadable?: boolean = false

  @Input()
  public enableDownload?: boolean = false

  @Output()
  public readonly downloadClicked: EventEmitter<void> = new EventEmitter()

  @Output() readonly onLoadMore: EventEmitter<void> = new EventEmitter()

  @Output()
  public readonly sortingClicked: EventEmitter<{ value: string; sortingDirection: string }> = new EventEmitter()

  private expandedRows: any[] = []

  public sortingDirection = new Map<String, string>()
  private defaultSorting: string

  constructor() {}

  ngOnInit() {}

  isExpanded(row: any): boolean {
    return this.expandedRow && this.expandedRows.includes(row[this.expandedRow.primaryKey])
  }

  expand(row: any) {
    if (this.expandedRow) {
      const key = row[this.expandedRow.primaryKey]
      const isExpaned = this.expandedRows.includes(key)

      // collapse
      if (isExpaned) {
        this.expandedRows = this.expandedRows.filter(expandedRow => expandedRow !== key)

        return
      }

      // expane
      this.expandedRows = this.expandedRows.concat(key)
    }
  }

  loadMore() {
    this.onLoadMore.emit()
  }

  public downloadCSV() {
    this.downloadClicked.emit()
  }

  public sorting(sortBy: string) {
    const key: string = sortBy
    if (this.sortingDirection.has(key)) {
      if (this.sortingDirection.get(key) === 'desc') {
        this.sortingDirection.clear()
        this.sortingDirection.set(key, 'asc')
      } else if (this.sortingDirection.get(key) === 'asc') {
        this.sortingDirection.clear()
        this.sortingDirection.set(this.defaultSorting, 'desc')
      }
    } else {
      this.sortingDirection.clear()
      this.sortingDirection.set(key, 'desc')
    }

    this.sortingClicked.emit({ value: sortBy, sortingDirection: this.sortingDirection.get(key) })
  }

  template(templateRef: TemplateRef<any> | Template): TemplateRef<any> {
    if (templateRef instanceof TemplateRef) {
      return templateRef
    }

    switch (templateRef) {
      case Template.basic:
        return this.basicTemplate
      case Template.block:
        return this.blockTemplate
      case Template.amount:
        return this.amountTemplate
      case Template.address:
        return this.addressTemplate
      case Template.hash:
        return this.hashTemplate
      case Template.modal:
        return this.modalTemplate
      case Template.percentage:
        return this.percentageTemplate
      case Template.symbol:
        return this.symbolTemplate
      case Template.timestamp:
        return this.timestampTemplate
      default:
        return this.basicTemplate
    }
  }
}
