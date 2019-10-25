import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-address-cell',
  templateUrl: './address-cell.component.html',
  styleUrls: ['./address-cell.component.scss']
})
export class AddressCellComponent {
  public clickable: boolean = true
  public address: string
  public multipleAddresses: string[]

  @Input() set data(value: string | string[]) {
    typeof value === 'string' ? (this.address = value) : (this.multipleAddresses = value)

    this.checkId()
  }

  public options: any = { pageId: undefined, showFullAddress: false, multipleAddresses: false }

  public checkId() {
    let check: boolean
    check = this.options.pageId !== this.address
    this.clickable = check
  }
}
