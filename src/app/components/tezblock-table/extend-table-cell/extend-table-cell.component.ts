import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-extend-table-cell',
  templateUrl: './extend-table-cell.component.html',
  styleUrls: ['./extend-table-cell.component.scss']
})
export class ExtendTableCellComponent {
  // public extended: boolean = false
  @Input() data: boolean
  // set data(value: any) {
  //   this.extended = value
  // } // TODO: any
}
