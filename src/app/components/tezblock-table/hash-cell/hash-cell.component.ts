import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-hash-cell',
  templateUrl: './hash-cell.component.html',
  styleUrls: ['./hash-cell.component.scss']
})
export class HashCellComponent {
  @Input() data: any

  @Input() options: { kind: 'transaction' | 'endorsement' }

  get linkPath(): string {
    return `/${this.options && this.options.kind || 'transaction'}`;
  }
}
