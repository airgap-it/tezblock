import { Component, Input } from '@angular/core'

import { getContractByAddress, Contract } from '@tezblock/domain/contract'

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
      this.contract = getContractByAddress(this.address)
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

  get path(): string {
    return `/${this.contract ? 'contract' : 'account'}`
  }

  private contract: Contract

  constructor() {}
}
