import { Component, Input, OnInit } from '@angular/core'
import { createIcon } from '@download/blockies'
import { BigNumber } from 'bignumber.js'
import { toDataUrl } from 'myetherwallet-blockies'

const accounts = require('src/submodules/tezos_assets/accounts.json')

@Component({
  selector: 'identicon',
  templateUrl: 'identicon.html',
  styleUrls: ['./identicon.scss']
})
export class IdenticonComponent implements OnInit {
  hasBakerIcon: boolean = false
  bakerIconUrl: string = ''

  identicon: string = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' // transparent

  @Input()
  sizeLarge: boolean = false

  @Input()
  set forceIdenticon(value: boolean) {
    if (value !== this._forceIdenticon) {
      this._forceIdenticon = value
      this.setIdenticon()
    }
  }
  get forceIdenticon(): boolean {
    return this._forceIdenticon
  }
  private _forceIdenticon: boolean = false

  @Input()
  set address(value: string) {
    if (value !== this._address) {
      this._address = value
      this.setIdenticon()
    }
  }
  get address(): string {
    return this._address
  }
  private _address: string

  ngOnInit() {}

  private b582int(val: string): string {
    let rv = new BigNumber(0)
    const alpha = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    for (let i = 0; i < val.length; i++) {
      rv = rv.plus(new BigNumber(alpha.indexOf(val[val.length - 1 - i])).multipliedBy(new BigNumber(alpha.length).exponentiatedBy(i)))
    }

    return rv.toString(16)
  }

  private setIdenticon() {
    const address = this.address

    if (!address) {
      return
    }

    const getIdenticon = (): string => {
      const displayLogo: boolean = accounts.hasOwnProperty(address) && accounts[address].hasLogo && !this.forceIdenticon

      if (displayLogo) {
        const logoReference = accounts[address].logoReference || address

        return `submodules/tezos_assets/imgs/${logoReference}.png`
      }

      if (address.startsWith('ak_')) {
        return createIcon({ seed: address }).toDataURL()
      }

      if (address.startsWith('tz') || address.startsWith('kt')) {
        return createIcon({ seed: `0${this.b582int(address)}`, spotcolor: '#000' }).toDataURL()
      }

      return toDataUrl(address)
    }

    this.identicon = getIdenticon()
  }
}
