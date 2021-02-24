import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  TrackByFunction,
  ViewChild
} from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Direction, getNextOrderBy, OrderBy } from '@tezblock/services/base.service'

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
  data?: (item: any) => { data?: any; options?: any }
  template?: TemplateRef<any> | Template
  sortable?: boolean | undefined
}

export interface ExpandedRow<Entity> {
  template: TemplateRef<any>
  getContext: (entity: Entity) => any
  primaryKey: string
}

export const blockAndTxHashColumns = (translate: TranslateService): Column[] => [
  {
    name: translate.instant('tezblock-table.block-and-txhash.block'),
    field: 'block_level',
    template: Template.block,
    sortable: true
  },
  {
    name: translate.instant('tezblock-table.block-and-txhash.tx-hash'),
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
  styleUrls: ['./tezblock-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TezblockTableComponent implements OnInit {
  @ViewChild('basicTemplate', { static: true }) public basicTemplate: TemplateRef<any>
  @ViewChild('amountTemplate', { static: true }) public amountTemplate: TemplateRef<any>
  @ViewChild('addressTemplate', { static: true }) public addressTemplate: TemplateRef<any>
  @ViewChild('percentageTemplate', { static: true }) public percentageTemplate: TemplateRef<any>
  @ViewChild('timestampTemplate', { static: true }) public timestampTemplate: TemplateRef<any>
  @ViewChild('blockTemplate', { static: true }) public blockTemplate: TemplateRef<any>
  @ViewChild('symbolTemplate', { static: true }) public symbolTemplate: TemplateRef<any>
  @ViewChild('hashTemplate', { static: true }) public hashTemplate: TemplateRef<any>
  @ViewChild('modalTemplate', { static: true }) public modalTemplate: TemplateRef<any>

  @Input() public data: any[]

  @Input() set columns(value: Column[]) {
    if (value !== this._columns) {
      this._columns = value ? value.map(satisfyData) : value
    }
  }
  get columns(): Column[] {
    return this._columns
  }
  private _columns: Column[]

  @Input() public loading: boolean

  @Input() public trackByFn?: TrackByFunction<any>

  @Input() public pagination? = false

  @Input() public expandedRow?: ExpandedRow<any>

  @Input()
  public downloadable?: boolean = false

  @Input()
  public enableDownload?: boolean = false

  @Input()
  public orderBy: OrderBy

  @Input()
  public noDataLabel: string

  @Output()
  downloadClicked: EventEmitter<void> = new EventEmitter()

  @Output()
  onLoadMore: EventEmitter<void> = new EventEmitter()

  @Output()
  onSort: EventEmitter<OrderBy> = new EventEmitter()

  @Output()
  rowExpanded: EventEmitter<any> = new EventEmitter()

  private expandedRows: any[] = []

  constructor() {}

  public ngOnInit() {}

  public isExpanded(row: any): boolean {
    return !!this.expandedRow && this.expandedRows.includes(row[this.expandedRow.primaryKey])
  }

  public expand(row: any) {
    if (this.expandedRow) {
      const key = row[this.expandedRow.primaryKey]
      const isExpaned = this.expandedRows.includes(key)

      // collapse
      if (isExpaned) {
        this.expandedRows = this.expandedRows.filter((expandedRow) => expandedRow !== key)

        return
      }

      // expane
      this.expandedRows = this.expandedRows.concat(key)
      this.rowExpanded.emit(row)
    }
  }

  public loadMore() {
    this.onLoadMore.emit()
  }

  public downloadCSV() {
    this.downloadClicked.emit()
  }

  public sorting(field: string) {
    this.onSort.emit(getNextOrderBy(this.orderBy, field))
  }

  public template(templateRef: TemplateRef<any> | Template): TemplateRef<any> {
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

  public getDirection(field: string): Direction {
    return this.orderBy && this.orderBy.field === field ? this.orderBy.direction : undefined
  }
}
