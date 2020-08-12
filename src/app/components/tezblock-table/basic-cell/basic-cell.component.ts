import { Component, Input, OnInit } from '@angular/core';

export interface Options {
  cssClass: string
}

@Component({
  selector: 'app-basic-cell',
  templateUrl: './basic-cell.component.html',
  styleUrls: ['./basic-cell.component.scss']
})
export class BasicCellComponent implements OnInit {

  @Input() data: string | number

  @Input() options: Options

  constructor() { }

  ngOnInit() {
  }

}
