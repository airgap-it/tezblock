import { Component, Input } from '@angular/core'

@Component({
  selector: 'address-cell',
  templateUrl: './address-cell.component.html',
  styleUrls: ['./address-cell.component.scss']
})
export class AddressCellComponent {
  public clickable: boolean = true
  public address: string

  @Input() set data(value: string) {
    this.address = value
    this.checkId()
  }

  @Input() options: any = { pageId: undefined, showFullAddress: false }

  public checkId() {
    let check: boolean
    check = this.options.pageId !== this.address
    this.clickable = check
  }
}
