import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-hash-cell',
  templateUrl: './hash-cell.component.html',
  styleUrls: ['./hash-cell.component.scss']
})
export class HashCellComponent {
  @Input()
  public data: any // TODO: any

  get linkPath(): string {
    return `/${this.options && this.options.kind || 'transaction'}`;
  }

  public options: { kind: 'transaction' | 'endorsement' }
}
