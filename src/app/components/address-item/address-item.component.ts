import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

import { getContractByAddress } from '@tezblock/domain/contract'

@Component({
  selector: 'address-item',
  templateUrl: './address-item.component.html',
  styleUrls: ['./address-item.component.scss']
})
export class AddressItemComponent {
  @Input()
  set address(value: string) {
    if (value !== this._address) {
      this._address = value
    }
  }
  get address(): string {
    return this._address || ''
  }
  private _address: string

  @Input()
  clickableButton: boolean = true

  @Input()
  hideIdenticon: boolean = false

  @Input()
  forceIdenticon: boolean = false

  @Input()
  showFull: boolean = false

  @Input()
  isText: boolean

  constructor(private readonly router: Router) {}

  public inspectDetail() {
    if (!this.isText && this.clickableButton) {
      const contract = getContractByAddress(this.address)

      if (contract) {
        this.router.navigate([`/contract/${this.address}`])

        return
      }

      this.router.navigate([`/account/${this.address}`])
    }
  }
}
