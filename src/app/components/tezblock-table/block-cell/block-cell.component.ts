import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-block-cell',
  templateUrl: './block-cell.component.html',
  styleUrls: ['./block-cell.component.scss']
})
export class BlockCellComponent {
  @Input()
  public data: any // TODO: any
}
