import { Component, Input } from '@angular/core'

@Component({
  selector: 'address-cell',
  templateUrl: './address-cell.component.html',
  styleUrls: ['./address-cell.component.scss']
})
export class AddressCellComponent {
  @Input() data: any

  @Input() options: any = { pageId: undefined, showFullAddress: false }

  get clickable(): boolean {
    return this.options && this.options.pageId ? this.options.pageId !== this.data : true
  }
}
