import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-extend-table-cell',
  templateUrl: './extend-table-cell.component.html',
  styleUrls: ['./extend-table-cell.component.scss']
})
export class ExtendTableCellComponent {
  public expanded: boolean = false
  constructor() {}

  @Input()
  public data: any

  invertExpanded() {
    this.expanded = !this.expanded
  }
}
