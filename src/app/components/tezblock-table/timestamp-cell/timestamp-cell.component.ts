import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timestamp-cell',
  templateUrl: './timestamp-cell.component.html',
  styleUrls: ['./timestamp-cell.component.scss'],
})
export class TimestampCellComponent {
  @Input() data: number;
}
