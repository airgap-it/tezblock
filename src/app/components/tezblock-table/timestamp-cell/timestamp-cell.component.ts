import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-timestamp-cell',
  templateUrl: './timestamp-cell.component.html',
  styleUrls: ['./timestamp-cell.component.scss']
})
export class TimestampCellComponent implements OnInit {
  public date: Date
  @Input() data: number

  ngOnInit() {
    if (this.data) {
      this.date = new Date(this.data)
    }
  }
}
