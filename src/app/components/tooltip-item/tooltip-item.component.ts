import { Component, Input } from '@angular/core'

@Component({
  selector: 'tooltip-item',
  templateUrl: './tooltip-item.component.html',
  styleUrls: ['./tooltip-item.component.scss']
})
export class TooltipItemComponent {
  @Input()
  public title: string

  @Input()
  public tooltip: string
}
