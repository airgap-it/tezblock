import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-extend-table-cell',
  templateUrl: './extend-table-cell.component.html',
  styleUrls: ['./extend-table-cell.component.scss'],
})
export class ExtendTableCellComponent {
  @Input() data: boolean;
}
