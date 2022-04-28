import { Component, Input, OnInit } from '@angular/core';
import { createIcon } from '@download/blockies';
import { BigNumber } from 'bignumber.js';
import { toDataUrl } from 'myetherwallet-blockies';
import { jsonAccounts } from '@tezblock/domain/account';
import { ContractAddress } from '@tezblock/domain/contract';

@Component({
  selector: 'identicon',
  templateUrl: 'identicon.html',
  styleUrls: ['./identicon.scss'],
})
export class IdenticonComponent implements OnInit {
  hasBakerIcon: boolean = false;
  bakerIconUrl: string = '';

  identicon: string =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // transparent

  @Input()
  sizeLarge: boolean = false;

  @Input()
  useImgUrl: string | undefined;

  @Input()
  set forceIdenticon(value: boolean) {
    if (value !== this._forceIdenticon) {
      this._forceIdenticon = value;
      this.setIdenticon();
    }
  }
  get forceIdenticon(): boolean {
    return this._forceIdenticon;
  }
  private _forceIdenticon: boolean = false;

  @Input()
  set imgUrl(value: string) {
    this.identicon = value;
  }

  @Input()
  set address(value: string) {
    if (value !== this._address) {
      this._address = value;
      this.setIdenticon();
    }
  }
  get address(): string {
    return this._address;
  }
  private _address: string;

  ngOnInit() {}

  private b582int(val: string): string {
    let rv = new BigNumber(0);
    const alpha = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    for (let i = 0; i < val.length; i++) {
      rv = rv.plus(
        new BigNumber(alpha.indexOf(val[val.length - 1 - i])).multipliedBy(
          new BigNumber(alpha.length).exponentiatedBy(i)
        )
      );
    }

    return rv.toString(16);
  }

  private setIdenticon() {
    if (!this.address) {
      return;
    }

    if (this.useImgUrl) {
      this.identicon = this.useImgUrl;
      return;
    }

    this.identicon = this.getIdenticon();
  }

  public getIdenticon() {
    const address = this._address;
    if (address === ContractAddress.TEZ) {
      return 'assets/img/symbols/tez.svg';
    }
    const displayLogo: boolean =
      jsonAccounts.hasOwnProperty(address) &&
      jsonAccounts[address].hasLogo &&
      !this.forceIdenticon;

    if (displayLogo) {
      const logoReference = jsonAccounts[address].logoReference || address;
      return `submodules/tezos_assets/imgs/${logoReference}.png`;
    }

    if (address.startsWith('ak_')) {
      return createIcon({ seed: address }).toDataURL();
    }

    if (address.startsWith('tz') || address.startsWith('kt')) {
      return createIcon({
        seed: `0${this.b582int(address)}`,
        spotcolor: '#000',
      }).toDataURL();
    }

    return toDataUrl(address);
  }
}
