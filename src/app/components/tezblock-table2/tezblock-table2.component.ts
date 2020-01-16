import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, TrackByFunction, ViewChild } from '@angular/core'

export enum Template {
  address,
  amount,
  basic,
  block,
  percentage,
  timestamp
}

export interface Column {
  name?: string
  field?: string
  width?: string
  data?: (item: any) => any
  template?: TemplateRef<any> | Template
}

export interface ExpandedRow<Entity> {
  template: TemplateRef<any>
  getContext: (entity: Entity) => any
}

const satisfyData = (column: Column): Column =>
  column.data ? column : { ...column, data: (item: any) => column.field ? item[column.field] : null }

@Component({
  selector: 'tezblock-table2',
  templateUrl: './tezblock-table2.component.html',
  styleUrls: ['./tezblock-table2.component.scss']
})
export class TezblockTable2Component implements OnInit {
  @ViewChild('basicTemplate', { static: true }) basicTemplate: TemplateRef<any>
  @ViewChild('amountTemplate', { static: true }) amountTemplate: TemplateRef<any>
  @ViewChild('addressTemplate', { static: true }) addressTemplate: TemplateRef<any>
  @ViewChild('percentageTemplate', { static: true }) percentageTemplate: TemplateRef<any>
  @ViewChild('timestampTemplate', { static: true }) timestampTemplate: TemplateRef<any>
  @ViewChild('blockTemplate', { static: true }) blockTemplate: TemplateRef<any>

  @Input() data: any[]

  @Input() primaryKey: string

  @Input() set columns(value: Column[]) {
    if (value !== this._columns) {
      this._columns = value ? value.map(satisfyData) : value
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

  @Output() readonly onLoadMore: EventEmitter<void> = new EventEmitter()

  private expandedRows: any[] = []

  constructor() {}

  ngOnInit() {}

  isExpanded(row: any): boolean {
    return this.expandedRow && this.expandedRows.includes(row[this.primaryKey])
  }

  expand(row: any) {
    if (this.expandedRow) {
      const key = row[this.primaryKey]
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
      case Template.percentage:
        return this.percentageTemplate
      case Template.timestamp:
        return this.timestampTemplate
      default:
        return this.basicTemplate
    }
  }
}
